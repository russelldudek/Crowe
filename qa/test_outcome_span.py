from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "site-v4.css").read_text(encoding="utf-8")
JS = (ROOT / "app.js").read_text(encoding="utf-8")


class OutcomeSpanSourceTests(unittest.TestCase):
    def test_semantic_workstream_frames_exist(self) -> None:
        self.assertIn('class="workstream-frame hero-workstream"', INDEX)
        self.assertIn('class="workstream-frame scenario-workstream"', INDEX)
        self.assertIn('href="site-v4.css?v=20260716-2"', INDEX)
        for condition in ("outcome", "workflow", "authority", "evidence", "ownership"):
            self.assertGreaterEqual(
                INDEX.count(f'data-condition="{condition}"'),
                2,
                f"{condition} must appear in hero and scenario frames",
            )
        self.assertGreaterEqual(INDEX.count("Owned operation"), 2)

    def test_rejected_bridge_motion_is_removed(self) -> None:
        forbidden_markup = (
            'class="signal"',
            'class="bridge-deck"',
            'class="mini-signal"',
            'class="mini-deck"',
            'class="pier ',
            'class="mini-pier ',
        )
        for fragment in forbidden_markup:
            self.assertNotIn(fragment, INDEX)
        self.assertNotIn("@keyframes crossSpan", CSS)
        self.assertNotRegex(CSS, r"animation\s*:[^;]*(?:infinite|alternate)")

    def test_single_run_assembly_and_static_end_state_are_defined(self) -> None:
        self.assertIn("@keyframes condition-settle", CSS)
        self.assertIn("@keyframes continuity-resolve", CSS)
        self.assertIn("@keyframes ownership-close", CSS)
        self.assertRegex(CSS, r"animation-iteration-count\s*:\s*1")
        self.assertIn("animation-fill-mode:both", CSS.replace(" ", ""))

    def test_scenario_state_schema_is_explicit(self) -> None:
        for field in (
            "conditionStates",
            "integrationState",
            "ownershipState",
            "boundaryState",
        ):
            self.assertIn(field, JS)
        for state in ("baseline", "speed", "agent", "orphan", "legacy"):
            self.assertRegex(JS, rf"\b{state}\s*:\s*\{{")
        for attribute in (
            "data-integration-state",
            "data-ownership-state",
            "data-boundary-state",
            "data-condition-state",
        ):
            self.assertIn(attribute, JS)

    def test_reduced_motion_resolves_immediately(self) -> None:
        reduced_motion = re.search(
            r"@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{(?P<body>.*)\}\s*$",
            CSS,
            re.S,
        )
        self.assertIsNotNone(reduced_motion)
        body = reduced_motion.group("body")
        self.assertIn("animation:none", body.replace(" ", ""))
        self.assertIn("transition:none", body.replace(" ", ""))

    def test_mobile_recomposition_is_not_scaled_desktop_art(self) -> None:
        self.assertIn("@media(max-width:560px)", CSS)
        self.assertRegex(
            CSS.replace(" ", ""),
            r"\.workstream-conditions\{[^}]*grid-template-columns:1fr",
        )
        self.assertNotRegex(
            CSS,
            r"\.hero-workstream[^}]*transform\s*:\s*scale",
        )


if __name__ == "__main__":
    unittest.main()
