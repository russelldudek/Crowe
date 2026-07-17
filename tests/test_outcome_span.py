from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOADER_CSS = (ROOT / "site-v4.css").read_text(encoding="utf-8")
STRIP_CSS = (ROOT / "site-v5.css").read_text(encoding="utf-8")
JS = (ROOT / "app.js").read_text(encoding="utf-8")


class OutcomeSpanSourceTests(unittest.TestCase):
    def test_loader_activates_cache_busted_strip_layer(self) -> None:
        self.assertIn("@import url('site-v3.css?v=20260716-1');", LOADER_CSS)
        self.assertIn("@import url('site-v5.css?v=20260717-1');", LOADER_CSS)
        self.assertIn("site-v5.css?v=20260717-1", JS)

    def test_runtime_replaces_both_legacy_components(self) -> None:
        self.assertIn("function buildHeroStrip()", JS)
        self.assertIn("function buildScenarioStrip()", JS)
        self.assertIn("legacyHero.replaceWith(buildHeroStrip())", JS)
        self.assertIn("legacyScenario.replaceWith(buildScenarioStrip())", JS)
        self.assertIn("outcome-strip outcome-strip--hero", JS)
        self.assertIn("outcome-strip outcome-strip--scenario", JS)
        self.assertGreaterEqual(JS.count('data-bay=\"operating-state\"'), 2)
        self.assertGreaterEqual(JS.count('class=\"integration-foundation\"'), 2)

    def test_active_css_contains_no_retired_geometry(self) -> None:
        combined = LOADER_CSS + "\n" + STRIP_CSS
        forbidden = (
            "ownership-terminal",
            "continuity-rail",
            "boundary-bracket",
            "workstream-frame",
            "workstream-conditions",
            "workstream-condition",
            "closure-width",
            "rail-y",
            "ownership-close",
        )
        for fragment in forbidden:
            self.assertNotIn(fragment, combined)

    def test_keyframes_do_not_change_layout_geometry(self) -> None:
        keyframes = re.findall(
            r"@keyframes\s+[\w-]+\s*\{(.*?)(?=\n\}\n(?:\n|\.|@)|\n\}\s*$)",
            STRIP_CSS,
            re.S,
        )
        self.assertGreaterEqual(len(keyframes), 5)
        forbidden_properties = (
            "width",
            "height",
            "grid-template-columns",
            "grid-template-rows",
            "margin",
            "padding",
            "left",
            "right",
            "top",
            "bottom",
            "translate",
            "scale",
        )
        for body in keyframes:
            for prop in forbidden_properties:
                self.assertNotRegex(body, rf"(?:^|[;{{])\s*{re.escape(prop)}\s*:")
        self.assertNotRegex(STRIP_CSS, r"animation\s*:[^;]*(?:infinite|alternate)")

    def test_scenario_schema_is_semantic(self) -> None:
        for field in (
            "conditionStates",
            "conditionLabels",
            "integrationState",
            "integrationLabel",
            "operatingState",
            "operatingLabel",
        ):
            self.assertIn(field, JS)
        for obsolete in (
            "ownershipState",
            "boundaryState",
            "data-ownership-state",
            "data-boundary-state",
        ):
            self.assertNotIn(obsolete, JS)

    def test_accessible_non_color_state_labels_exist(self) -> None:
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
        self.assertIn("operating-state__decision", JS)
        self.assertIn("integration-foundation__state", JS)

    def test_responsive_recomposition_is_explicit(self) -> None:
        compact = STRIP_CSS.replace(" ", "")
        self.assertIn("@media(max-width:900px)", compact)
        self.assertRegex(
            compact,
            r"@media\(max-width:900px\).*?grid-template-columns:repeat\(3,minmax\(0,1fr\)\)",
        )
        self.assertIn("@media(max-width:560px)", compact)
        self.assertRegex(
            compact,
            r"@media\(max-width:560px\).*?grid-template-columns:1fr",
        )

    def test_reduced_motion_resolves_to_owned_operation(self) -> None:
        reduced = re.search(
            r"@media\s*\(prefers-reduced-motion:reduce\)\s*\{(?P<body>.*)\}\s*$",
            STRIP_CSS,
            re.S,
        )
        self.assertIsNotNone(reduced)
        body = reduced.group("body").replace(" ", "")
        self.assertIn("animation:none!important", body)
        self.assertIn("transition:none!important", body)
        self.assertIn(".operating-state__forming{opacity:0!important}", body)
        self.assertIn(".operating-state__owned{opacity:1!important}", body)


if __name__ == "__main__":
    unittest.main()
