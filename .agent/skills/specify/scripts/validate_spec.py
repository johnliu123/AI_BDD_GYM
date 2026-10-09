"""Validate deterministic structure and requirement traceability in a spec."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


PLACEHOLDER = re.compile(r"\{\{[^{}]+\}\}")
STORY_HEADING = re.compile(r"^### 使用者故事\s+(\d+)\b")
REQUIREMENT_LINE = re.compile(
    r"^\s*-\s+\*\*((?:FR|NFR)-\d{3})\*\*(?:（適用於([^）]+)）)?:"
)
SUCCESS_LINE = re.compile(r"^\s*-\s+\*\*(SC-\d{3})\*\*:")
GLOBAL_REFERENCE = re.compile(r"\b(?:FR|NFR)-\d{3}\b")
ACCEPTANCE_LINE = re.compile(
    r"^\s*\d+\.\s+\*\*Given\*\*.+\*\*When\*\*.+\*\*Then\*\*.+$"
)


def validate(path: Path) -> list[str]:
    errors: list[str] = []
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as error:
        return [f"Cannot read {path}: {error}"]

    if PLACEHOLDER.search(text):
        errors.append("Unresolved template placeholders ({{...}}) remain.")

    lines = text.splitlines()
    required_headings = (
        "## 使用者情境與測試",
        "## 成功標準",
        "## 假設",
    )
    for heading in required_headings:
        if not any(line.startswith(heading) for line in lines):
            errors.append(f"Missing required section: {heading}")

    stories: dict[str, tuple[int, int]] = {}
    story_starts: list[tuple[int, str]] = []
    for index, line in enumerate(lines):
        match = STORY_HEADING.match(line)
        if match:
            story_starts.append((index, match.group(1)))

    if not story_starts:
        errors.append("At least one '### 使用者故事 N' section is required.")
    story_ids = [story_id for _, story_id in story_starts]
    for story_id in sorted(set(story_ids)):
        if story_ids.count(story_id) > 1:
            errors.append(f"User Story number {story_id} is defined more than once.")

    section_markers: list[tuple[int, str]] = []
    for index, line in enumerate(lines):
        if line.startswith("## ") or line.startswith("### "):
            section_markers.append((index, line))

    for position, (start, story_id) in enumerate(story_starts):
        end = len(lines)
        for marker_index, marker in section_markers:
            if marker_index <= start:
                continue
            if marker.startswith("## ") or marker.startswith("### 邊界情況") or STORY_HEADING.match(marker):
                end = marker_index
                break
        stories[story_id] = (start, end)

    story_references: dict[str, set[str]] = {story_id: set() for story_id in stories}
    story_reference_sections: set[str] = set()
    global_requirements: dict[str, set[str]] = {}
    defined_requirements: list[str] = []
    success_ids: list[str] = []
    current_story: str | None = None
    in_global = False

    for line in lines:
        story_match = STORY_HEADING.match(line)
        if story_match:
            current_story = story_match.group(1)
            in_global = False
        elif line.startswith("## 全域需求"):
            current_story = None
            in_global = True
        elif line.startswith("## ") or line.startswith("### 邊界情況"):
            current_story = None
            in_global = False

        requirement_match = REQUIREMENT_LINE.match(line)
        if requirement_match:
            requirement_id, applicability = requirement_match.groups()
            defined_requirements.append(requirement_id)
            if in_global:
                if not applicability:
                    errors.append(
                        f"Global requirement {requirement_id} must list applicable User Stories."
                    )
                else:
                    applicable_stories = set(re.findall(r"\d+", applicability))
                    global_requirements[requirement_id] = applicable_stories
                    if len(applicable_stories) < 2:
                        errors.append(
                            f"Global requirement {requirement_id} must apply to at least two User Stories."
                        )
            elif current_story is None:
                errors.append(
                    f"Requirement {requirement_id} is outside a User Story or Global Requirements section."
                )

        success_match = SUCCESS_LINE.match(line)
        if success_match:
            success_ids.append(success_match.group(1))

        if current_story and "全域需求參照" in line:
            story_reference_sections.add(current_story)
            story_references[current_story].update(GLOBAL_REFERENCE.findall(line))

    for story_id, (start, end) in stories.items():
        story_lines = lines[start:end]
        for heading in ("**驗收情境**", "**功能需求（FR）**", "**非功能需求（NFR）**"):
            if not any(heading in line for line in story_lines):
                errors.append(f"User Story {story_id} is missing {heading}.")
        if story_id not in story_reference_sections:
            errors.append(f"User Story {story_id} is missing its 全域需求參照 field.")
        acceptance_count = sum(bool(ACCEPTANCE_LINE.match(line)) for line in story_lines)
        if acceptance_count < 2:
            errors.append(
                f"User Story {story_id} must contain at least two Given/When/Then acceptance scenarios."
            )

    for requirement_id in sorted(set(defined_requirements)):
        if defined_requirements.count(requirement_id) > 1:
            errors.append(f"Requirement ID {requirement_id} is defined more than once.")

    for success_id in sorted(set(success_ids)):
        if success_ids.count(success_id) > 1:
            errors.append(f"Success criterion ID {success_id} is defined more than once.")

    for story_id, references in story_references.items():
        for requirement_id in sorted(references):
            applicable_stories = global_requirements.get(requirement_id)
            if applicable_stories is None:
                errors.append(
                    f"User Story {story_id} references {requirement_id}, but it is not defined globally."
                )
            elif story_id not in applicable_stories:
                errors.append(
                    f"Global requirement {requirement_id} does not list referencing User Story {story_id}."
                )

    for requirement_id, applicable_stories in global_requirements.items():
        if not applicable_stories:
            errors.append(f"Global requirement {requirement_id} has no applicable User Stories.")
        for story_id in sorted(applicable_stories):
            if story_id not in stories:
                errors.append(
                    f"Global requirement {requirement_id} lists unknown User Story {story_id}."
                )
            elif requirement_id not in story_references[story_id]:
                errors.append(
                    f"User Story {story_id} is listed for {requirement_id} but does not reference it."
                )

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Check spec headings, placeholders, IDs, and global requirement references."
    )
    parser.add_argument("spec_path", type=Path, help="Path to a completed spec Markdown file")
    arguments = parser.parse_args()

    errors = validate(arguments.spec_path)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print(f"Validation passed: {arguments.spec_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())