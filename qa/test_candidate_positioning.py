from __future__ import annotations

import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

CANDIDATE_HTML = (
    "index.html",
    "resume.html",
    "cover-letter.html",
    "interview-brief.html",
    "90-day-plan.html",
    "fde-workstream-review.html",
)

FORBIDDEN = (
    "Strongest reasonable concern",
    "Strongest reasonable hiring question",
    "enough verified tenure",
    "remaining platform-specific depth",
    "Do not inflate a résumé",
    "Review the technical-value case",
    "technical-value case",
    "objection-analysis.html",
    "does not substantiate production tenure",
    "platform fluency is proven",
    "specific gaps, exercises, mentors",
    "My affirmative case is not",
    "I have used everything",
    "keyword matching",
    "verified production tenure in every platform",
)


class CandidatePositioningTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.content = {
            name: (ROOT / name).read_text(encoding="utf-8")
            for name in CANDIDATE_HTML
        }
        cls.combined = "\n".join(cls.content.values())

    def test_objection_first_language_is_absent(self) -> None:
        for phrase in FORBIDDEN:
            self.assertNotIn(phrase, self.combined)

    def test_strength_first_homepage_section_is_present(self) -> None:
        index = self.content["index.html"]
        self.assertIn("Technical contribution", index)
        self.assertIn("Platform judgment anchored in the work.", index)
        self.assertIn("Review the delivery artifact", index)
        self.assertNotIn("claim-note", index)

    def test_cover_letter_leads_with_platform_judgment(self) -> None:
        letter = self.content["cover-letter.html"]
        self.assertIn("My platform judgment starts with the work", letter)
        self.assertNotIn("The posting’s emphasis on Power Platform", letter)

    def test_interview_brief_keeps_objections_internal(self) -> None:
        brief = self.content["interview-brief.html"]
        self.assertIn("Contribution architecture", brief)
        self.assertIn("Builder-consultant who turns architecture decisions into operating results.", brief)
        self.assertNotIn("Proposed technical working session", brief)

    def test_entry_plan_uses_normal_quality_language(self) -> None:
        plan = self.content["90-day-plan.html"]
        self.assertIn("established quality reviews", plan)
        self.assertIn("Priority platform patterns, practice resources, and applied proof points.", plan)
        self.assertNotIn("Overextending before platform fluency is proven", plan)

    def test_resume_uses_concise_stem_and_publication_language(self) -> None:
        resume = self.content["resume.html"]
        self.assertIn("STEM · Academic and industrial publications indexed at", resume)
        self.assertIn("Google Scholar", resume)
        self.assertNotIn("Academic grounding includes materials science", resume)
        self.assertNotIn("Food Safety Management Certification", resume)

    def test_disqualifying_artifact_is_removed(self) -> None:
        self.assertFalse((ROOT / "objection-analysis.html").exists())
        self.assertFalse((ROOT / "docs/Russell-Dudek-Crowe-Technical-Value-Case.pdf").exists())


if __name__ == "__main__":
    unittest.main()
