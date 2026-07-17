from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
LOADER_CSS = (ROOT / "site-v4.css").read_text(encoding="utf-8")
STRIP_CSS = (ROOT / "site-v5.css").read_text(encoding="utf-8")
JS = (ROOT / "app.js").read_text(encoding="utf-8")


class OutcomeSpanSourceTests(unittest.TestCase):
    def test_legacy_mounts_are_replaced_by_distinct_hero_and_scenario_components(self) -> None:
        self.assertIn('class="workstream-frame hero-workstream"', INDEX)
        self.assertIn('class="workstream-frame scenario-workstream"', INDEX)
        self.assertIn("function buildOutcomeVolumeStage()", JS)
        self.assertIn("legacyHero.replaceWith(buildOutcomeVolumeStage())", JS)
        self.assertIn("legacyScenario.replaceWith(buildScenarioStrip())", JS)
        self.assertIn("outcome-strip outcome-strip--scenario", JS)
        self.assertNotIn("function buildHeroStrip()", JS)

    def test_rejected_bridge_and_bracket_motion_are_inactive(self) -> None:
        combined = LOADER_CSS + "\n" + STRIP_CSS
        for fragment in (
            "ownership-terminal",
            "continuity-rail",
            "boundary-bracket",
            "closure-width",
            "rail-y",
            "@keyframes crossSpan",
        ):
            self.assertNotIn(fragment, combined)
        self.assertNotRegex(combined, r"animation\s*:[^;]*(?:infinite|alternate)")

    def test_scenario_strip_contains_six_fixed_bays_and_full_width_foundation(self) -> None:
        self.assertGreaterEqual(JS.count('class="outcome-bay" data-condition='), 5)
        self.assertIn('data-bay="operating-state"', JS)
        self.assertIn('class="integration-foundation"', JS)
        compact = re.sub(r"\s+", "", STRIP_CSS)
        self.assertIn("grid-template-columns:repeat(5,minmax(0,1fr))minmax(168px,1.42fr)", compact)
        self.assertIn(".integration-foundation", STRIP_CSS)
        self.assertIn("width:100%", STRIP_CSS)

    def test_scenario_state_schema_is_semantic(self) -> None:
        for field in (
            "conditionStates",
            "conditionLabels",
            "integrationState",
            "integrationLabel",
            "operatingState",
            "operatingLabel",
        ):
            self.assertIn(field, JS)
        for state in ("baseline", "speed", "agent", "orphan", "legacy"):
            self.assertRegex(JS, rf"\b{state}\s*:\s*\{{")
        for obsolete in (
            "ownershipState",
            "boundaryState",
            "data-ownership-state",
            "data-boundary-state",
        ):
            self.assertNotIn(obsolete, JS)

    def test_non_color_state_labels_remain_explicit(self) -> None:
        for label in (
            "Confirmed",
            "Proof unresolved",
            "Owner unresolved",
            "Boundary required",
            "Boundary uncertain",
            "Action envelope required",
        ):
            self.assertIn(label, JS)
        self.assertIn("aria-pressed", JS)

    def test_reduced_motion_resolves_scenario_changes_immediately(self) -> None:
        reduced_motion = re.search(
            r"@media\s*\(prefers-reduced-motion:reduce\)\s*\{(?P<body>.*)\}\s*$",
            STRIP_CSS,
            re.S,
        )
        self.assertIsNotNone(reduced_motion)
        body = reduced_motion.group("body").replace(" ", "")
        self.assertIn("transition:none!important", body)

    def test_tablet_and_mobile_recomposition_are_not_scaled_desktop_art(self) -> None:
        compact = re.sub(r"\s+", "", STRIP_CSS)
        self.assertRegex(
            compact,
            r"@media\(max-width:900px\).*?grid-template-columns:repeat\(3,minmax\(0,1fr\)\)",
        )
        self.assertRegex(
            compact,
            r"@media\(max-width:560px\).*?grid-template-columns:1fr",
        )
        self.assertNotRegex(STRIP_CSS, r"\.outcome-strip[^}]*transform\s*:\s*scale")


if __name__ == "__main__":
    unittest.main()
