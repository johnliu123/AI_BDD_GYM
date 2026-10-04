#!/usr/bin/env python3
"""
analyze_tbd_context.py — TBD Stage 0 / health-check evidence (Evidence First).

Collects trunk name, branch ages, merge patterns, CI hints, Gitflow signals,
and coarse feature-flag dependency hints into one JSON blob.

Usage:
    python analyze_tbd_context.py [--repo PATH] [--include-health]

Output: JSON on stdout. Exit 0 on success, 1 if not a git repo.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8", errors="replace")

CI_CANDIDATES = [
    ".github/workflows",
    ".gitlab-ci.yml",
    "Jenkinsfile",
    "azure-pipelines.yml",
    ".circleci/config.yml",
    "bitbucket-pipelines.yml",
]

FLAG_KEYWORDS = [
    "launchdarkly",
    "unleash",
    "flagsmith",
    "split.io",
    "featureflag",
    "feature_flag",
    "feature-flag",
]

DEPENDENCY_FILES = [
    "package.json",
    "requirements.txt",
    "pyproject.toml",
    "go.mod",
    "Cargo.toml",
    "pom.xml",
    "build.gradle",
    "Gemfile",
]


def run_git(args: list[str], cwd: Path) -> tuple[int, str, str]:
    try:
        result = subprocess.run(
            ["git"] + args,
            cwd=cwd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=60,
        )
        return result.returncode, result.stdout.strip(), result.stderr.strip()
    except FileNotFoundError:
        return 127, "", "git executable not found"
    except subprocess.TimeoutExpired:
        return 124, "", "git command timed out"


def parse_iso_timestamp(raw: str) -> datetime | None:
    raw = raw.strip()
    if not raw:
        return None
    for fmt in (
        "%Y-%m-%d %H:%M:%S %z",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%SZ",
    ):
        try:
            dt = datetime.strptime(raw.replace(" +", "+"), fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            continue
    return None


def detect_trunk(cwd: Path) -> dict:
    trunk = {"name": None, "source": None, "candidates": []}
    code, out, _ = run_git(["symbolic-ref", "refs/remotes/origin/HEAD"], cwd)
    if code == 0 and out.startswith("refs/remotes/origin/"):
        trunk["name"] = out.split("/")[-1]
        trunk["source"] = "origin/HEAD"
    for candidate in ("main", "master"):
        code, _, _ = run_git(["rev-parse", "--verify", candidate], cwd)
        if code == 0:
            trunk["candidates"].append(candidate)
    if not trunk["name"] and trunk["candidates"]:
        trunk["name"] = trunk["candidates"][0]
        trunk["source"] = "local_default"
    return trunk


def branch_tip_timestamp(cwd: Path, ref: str) -> datetime | None:
    code, out, _ = run_git(["log", "-1", "--format=%ci", ref], cwd)
    if code != 0:
        return None
    return parse_iso_timestamp(out)


def branch_age_days(cwd: Path, ref: str, now: datetime) -> float | None:
    code, out, _ = run_git(["log", "--reverse", "--format=%ci", ref], cwd)
    if code != 0 or not out:
        return None
    first_line = out.splitlines()[0]
    started = parse_iso_timestamp(first_line)
    if not started:
        return None
    delta = now - started.astimezone(timezone.utc)
    return round(delta.total_seconds / 86400, 2)


def list_local_branches(cwd: Path) -> list[str]:
    code, out, _ = run_git(["branch", "--format=%(refname:short)"], cwd)
    if code != 0:
        return []
    return [b.strip() for b in out.splitlines() if b.strip()]


def commits_ahead_behind(cwd: Path, branch: str, trunk: str) -> dict:
    ahead = behind = 0
    code, out, _ = run_git(["rev-list", "--left-right", "--count", f"{trunk}...{branch}"], cwd)
    if code == 0 and out:
        parts = out.split()
        if len(parts) == 2:
            behind, ahead = int(parts[0]), int(parts[1])
    return {"ahead_of_trunk": ahead, "behind_trunk": behind}


def recent_merge_style(cwd: Path, trunk: str, limit: int = 20) -> dict:
    code, out, _ = run_git(["log", f"-{limit}", "--merges", "--oneline", trunk], cwd)
    merge_commits = len(out.splitlines()) if code == 0 and out else 0
    code2, out2, _ = run_git(["log", f"-{limit}", "--oneline", trunk], cwd)
    total = len(out2.splitlines()) if code2 == 0 and out2 else 0
    style = "unknown"
    if total == 0:
        style = "no_history"
    elif merge_commits == 0:
        style = "likely_linear_or_squash"
    elif merge_commits >= max(1, total // 3):
        style = "merge_commits_common"
    else:
        style = "mixed"
    return {
        "sample_size": total,
        "merge_commits_in_sample": merge_commits,
        "inferred_style": style,
    }


def scan_ci_and_flags(repo: Path) -> dict:
    ci_paths = []
    for rel in CI_CANDIDATES:
        p = repo / rel
        if p.exists():
            ci_paths.append(rel)
    flag_hits: list[dict] = []
    for dep in DEPENDENCY_FILES:
        p = repo / dep
        if not p.is_file():
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="replace").lower()
        except OSError:
            continue
        for kw in FLAG_KEYWORDS:
            if kw in text:
                flag_hits.append({"file": dep, "keyword": kw})
    return {"ci_config_paths": ci_paths, "has_ci": bool(ci_paths), "flag_dependency_hints": flag_hits}


def classify_workflow(branches: list[str], trunk: str | None) -> str:
    names = {b for b in branches if b != trunk}
    lower = " ".join(names).lower()
    if any(x in lower for x in ("develop", "release/", "hotfix/")):
        return "gitflow_like"
    if len(names) <= 1:
        return "tbd_like_minimal"
    if len(names) <= 3:
        return "tbd_like"
    return "many_active_branches"


def health_assessment(active_count: int, max_age_days: float | None, has_ci: bool) -> dict:
    items = []
    branch_ok = active_count <= 3
    items.append(
        {
            "metric": "active_branch_count",
            "value": active_count,
            "healthy": branch_ok,
            "benchmark": "<= 3 (DORA)",
        }
    )
    age_ok = max_age_days is None or max_age_days < 2
    items.append(
        {
            "metric": "max_branch_age_days",
            "value": max_age_days,
            "healthy": age_ok,
            "benchmark": "< 2 days hard limit",
        }
    )
    items.append(
        {
            "metric": "ci_present",
            "value": has_ci,
            "healthy": has_ci,
            "benchmark": "automated CI recommended for TBD",
        }
    )
    overall = all(i["healthy"] for i in items if i["metric"] != "ci_present") and (
        has_ci or active_count <= 1
    )
    return {"checks": items, "overall_healthy_hint": overall}


def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze git repo for TBD context")
    parser.add_argument("--repo", type=Path, default=Path("."), help="Repository root")
    parser.add_argument(
        "--include-health",
        action="store_true",
        help="Include DORA-style health assessment block",
    )
    args = parser.parse_args()
    repo = args.repo.resolve()

    code, _, err = run_git(["rev-parse", "--git-dir"], repo)
    if code != 0:
        print(json.dumps({"error": "not_a_git_repository", "detail": err}, ensure_ascii=False))
        return 1

    now = datetime.now(timezone.utc)
    trunk_info = detect_trunk(repo)
    trunk_name = trunk_info.get("name")
    current_branch = None
    code, out, _ = run_git(["branch", "--show-current"], repo)
    if code == 0:
        current_branch = out or None

    branches = list_local_branches(repo)
    branch_details = []
    max_age = None
    for b in branches:
        if b == trunk_name:
            continue
        age = branch_age_days(repo, b, now)
        if age is not None and (max_age is None or age > max_age):
            max_age = age
        detail = {
            "name": b,
            "age_days": age,
            "is_current": b == current_branch,
        }
        if trunk_name:
            detail.update(commits_ahead_behind(repo, b, trunk_name))
        branch_details.append(detail)

    active_count = len(branch_details)
    merge_info = recent_merge_style(repo, trunk_name) if trunk_name else {}

    payload = {
        "repo": str(repo),
        "generated_at_utc": now.isoformat(),
        "current_branch": current_branch,
        "trunk": trunk_info,
        "branches": branch_details,
        "active_branch_count_excluding_trunk": active_count,
        "workflow_style_hint": classify_workflow(branches, trunk_name),
        "recent_trunk_history": merge_info,
        "infrastructure": scan_ci_and_flags(repo),
        "special_state": {},
    }

    code, out, _ = run_git(["status", "--porcelain"], repo)
    if code == 0:
        payload["working_tree_dirty"] = bool(out.strip())

    if trunk_name and current_branch and current_branch != trunk_name:
        payload["current_vs_trunk"] = commits_ahead_behind(repo, current_branch, trunk_name)

    if args.include_health:
        payload["health"] = health_assessment(
            active_count,
            max_age,
            payload["infrastructure"]["has_ci"],
        )

    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
