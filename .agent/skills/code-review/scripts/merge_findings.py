"""Merge and deduplicate SARIF findings from multiple code analysis tools.

Usage:
    uv run scripts/merge_findings.py <sarif1.json> [sarif2.json ...] [--out-md findings.md] [--out-json findings.json]

What this script does (deterministic, no judgment):
    - Parses one or more SARIF 2.1.0 JSON files (the common output format shared by
      Semgrep, CodeQL, Trivy, Gitleaks --sarif, TruffleHog --sarif, and many other
      SAST/SCA/secret-scanning tools listed in references/Reference-分析工具地圖.md).
    - Extracts: tool name, rule id, message, file path, start/end line, and any CWE
      tag found in the rule or result properties.
    - Deduplicates candidate findings that point at the exact same file + line,
      merging them into one record while preserving every contributing tool/rule id.
    - Emits a sorted Markdown table (by file, then line) and an optional JSON dump.

What this script does NOT do (left to human / AI judgment per the skill's rules):
    - It does NOT decide whether a finding is Confirmed / Suspected / Suggestion.
    - It does NOT assign CRITICAL/HIGH/MEDIUM/LOW severity.
    - It does NOT guess CWE when the tool did not provide one.
    - It does NOT fuzzy-match findings on nearby (but not identical) lines.
  These require the judgment steps defined in
  rules/Rule-CodeReview-證據與確認層級.md and rules/Rule-CodeReview-嚴重度與風險排序.md.
"""

# /// script
# requires-python = ">=3.9"
# dependencies = []
# ///

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path


CWE_TAG_RE = re.compile(r"cwe-(\d+)", re.IGNORECASE)
CWE_TEXT_RE = re.compile(r"CWE-(\d+)")


@dataclass
class RawResult:
    tool: str
    rule_id: str
    level: str
    message: str
    file: str
    start_line: int | None
    end_line: int | None
    cwe: str | None


@dataclass
class MergedFinding:
    file: str
    line: int
    end_line: int | None
    sources: list[RawResult] = field(default_factory=list)

    @property
    def tools(self) -> list[str]:
        seen: list[str] = []
        for r in self.sources:
            if r.tool not in seen:
                seen.append(r.tool)
        return seen

    @property
    def rule_ids(self) -> list[str]:
        seen: list[str] = []
        for r in self.sources:
            if r.rule_id not in seen:
                seen.append(r.rule_id)
        return seen

    @property
    def cwes(self) -> list[str]:
        seen: list[str] = []
        for r in self.sources:
            if r.cwe and r.cwe not in seen:
                seen.append(r.cwe)
        return seen

    @property
    def levels(self) -> list[str]:
        seen: list[str] = []
        for r in self.sources:
            if r.level not in seen:
                seen.append(r.level)
        return seen

    @property
    def sample_message(self) -> str:
        return self.sources[0].message if self.sources else ""


def _extract_cwe(*texts: str | None) -> str | None:
    for text in texts:
        if not text:
            continue
        m = CWE_TAG_RE.search(text) or CWE_TEXT_RE.search(text)
        if m:
            return f"CWE-{int(m.group(1))}"
    return None


def parse_sarif_file(path: Path) -> list[RawResult]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"WARN: skipping {path} (unreadable or invalid JSON: {exc})", file=sys.stderr)
        return []

    runs = data.get("runs")
    if not isinstance(runs, list):
        print(f"WARN: skipping {path} (no SARIF 'runs' array found)", file=sys.stderr)
        return []

    results: list[RawResult] = []
    for run in runs:
        tool_name = (
            run.get("tool", {}).get("driver", {}).get("name", "unknown-tool")
        )
        rules_by_id: dict[str, dict] = {}
        for rule in run.get("tool", {}).get("driver", {}).get("rules", []) or []:
            rid = rule.get("id")
            if rid:
                rules_by_id[rid] = rule

        for res in run.get("results", []) or []:
            rule_id = res.get("ruleId", "unknown-rule")
            level = res.get("level", "warning")
            message = (res.get("message", {}) or {}).get("text", "")

            rule_meta = rules_by_id.get(rule_id, {})
            rule_tags = (rule_meta.get("properties", {}) or {}).get("tags", []) or []
            result_tags = (res.get("properties", {}) or {}).get("tags", []) or []
            cwe = _extract_cwe(
                *(str(t) for t in rule_tags),
                *(str(t) for t in result_tags),
                rule_meta.get("name"),
                message,
            )

            locations = res.get("locations", []) or []
            if not locations:
                results.append(
                    RawResult(tool_name, rule_id, level, message, "(no location)", None, None, cwe)
                )
                continue

            for loc in locations:
                phys = loc.get("physicalLocation", {}) or {}
                artifact = (phys.get("artifactLocation", {}) or {}).get("uri", "(unknown file)")
                region = phys.get("region", {}) or {}
                start_line = region.get("startLine")
                end_line = region.get("endLine", start_line)
                results.append(
                    RawResult(tool_name, rule_id, level, message, artifact, start_line, end_line, cwe)
                )

    return results


def merge_results(all_results: list[RawResult]) -> list[MergedFinding]:
    groups: dict[tuple[str, int | None], MergedFinding] = {}
    for r in all_results:
        key = (r.file, r.start_line)
        if key not in groups:
            groups[key] = MergedFinding(file=r.file, line=r.start_line or 0, end_line=r.end_line)
        groups[key].sources.append(r)

    merged = list(groups.values())
    merged.sort(key=lambda m: (m.file, m.line))
    return merged


def to_markdown(merged: list[MergedFinding]) -> str:
    lines = [
        "| ID | File | Line | Tools | Rule IDs | CWE | Tool Level(s) | Sample Message |",
        "|----|------|------|-------|----------|-----|---------------|-----------------|",
    ]
    for i, m in enumerate(merged, start=1):
        line_display = str(m.line) if m.line else "-"
        cwe_display = ", ".join(m.cwes) if m.cwes else "-"
        message = m.sample_message.replace("|", "\\|").replace("\n", " ")
        if len(message) > 100:
            message = message[:97] + "..."
        lines.append(
            f"| F{i} | `{m.file}` | {line_display} | {', '.join(m.tools)} | "
            f"{', '.join(m.rule_ids)} | {cwe_display} | {', '.join(m.levels)} | {message} |"
        )
    note = (
        "\n> NOTE: `Tool Level(s)` is the raw level reported by the scanning tool "
        "(error/warning/note). It is NOT a Confirmed/Suspected classification and NOT a "
        "CRITICAL/HIGH/MEDIUM/LOW severity rating. Apply "
        "`rules/Rule-CodeReview-證據與確認層級.md` and "
        "`rules/Rule-CodeReview-嚴重度與風險排序.md` before using these rows in the report."
    )
    return "\n".join(lines) + note + "\n"


def to_json(merged: list[MergedFinding]) -> str:
    payload = [
        {
            "candidate_id": f"F{i}",
            "file": m.file,
            "line": m.line,
            "end_line": m.end_line,
            "tools": m.tools,
            "rule_ids": m.rule_ids,
            "cwe": m.cwes,
            "tool_levels": m.levels,
            "sample_message": m.sample_message,
            "source_count": len(m.sources),
        }
        for i, m in enumerate(merged, start=1)
    ]
    return json.dumps(payload, ensure_ascii=False, indent=2)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sarif_files", nargs="+", type=Path, help="One or more SARIF JSON files to merge")
    parser.add_argument("--out-md", type=Path, default=None, help="Write merged Markdown table to this path")
    parser.add_argument("--out-json", type=Path, default=None, help="Write merged JSON array to this path")
    args = parser.parse_args()

    all_results: list[RawResult] = []
    for path in args.sarif_files:
        if not path.exists():
            print(f"WARN: {path} does not exist, skipping", file=sys.stderr)
            continue
        all_results.extend(parse_sarif_file(path))

    if not all_results:
        print("ERROR: no results parsed from any input file", file=sys.stderr)
        return 1

    merged = merge_results(all_results)
    md = to_markdown(merged)
    js = to_json(merged)

    if args.out_md:
        args.out_md.write_text(md, encoding="utf-8")
        print(f"Wrote Markdown table ({len(merged)} merged findings) to {args.out_md}")
    else:
        print(md)

    if args.out_json:
        args.out_json.write_text(js, encoding="utf-8")
        print(f"Wrote JSON ({len(merged)} merged findings) to {args.out_json}")

    print(
        f"Parsed {len(all_results)} raw results from {len(args.sarif_files)} file(s), "
        f"merged into {len(merged)} unique (file, line) findings.",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
