from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ThreeOutcomeVolumeSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.app = (ROOT / "app.js").read_text(encoding="utf-8")
        cls.css = (ROOT / "site-v6.css").read_text(encoding="utf-8")
        cls.runtime = (ROOT / "three-outcome-volume.js").read_text(encoding="utf-8")
        cls.three = ROOT / "assets/vendor/three/three.module.min.js"

    def test_hero_uses_outcome_volume_not_the_explicit_strip(self) -> None:
        self.assertIn("function buildOutcomeVolumeStage()", self.app)
        self.assertIn("loadOutcomeVolume", self.app)
        self.assertIn("outcome-volume-stage", self.app)
        self.assertIn("legacyHero.replaceWith(buildOutcomeVolumeStage())", self.app)
        self.assertNotIn("legacyHero.replaceWith(buildHeroStrip())", self.app)
        self.assertIn("outcome-strip--scenario", self.app)

    def test_three_runtime_is_local_and_pinned(self) -> None:
        self.assertTrue(self.three.is_file(), "local Three.js runtime is missing")
        self.assertGreater(self.three.stat().st_size, 500_000)
        self.assertIn(
            "import * as THREE from './assets/vendor/three/three.module.min.js';",
            self.runtime,
        )
        self.assertNotRegex(self.runtime, r"https?://")

    def test_scene_contains_five_semantic_fields_and_one_foundation(self) -> None:
        for name in ("outcome", "workflow", "authority", "evidence", "ownership"):
            self.assertIn(f"id: '{name}'", self.runtime)
        self.assertIn("fieldCount: FIELD_SPECS.length", self.runtime)
        self.assertIn("createFoundation", self.runtime)
        self.assertIn("createContinuitySeam", self.runtime)

    def test_motion_is_one_shot_and_settles(self) -> None:
        self.assertIn("settled: false", self.runtime)
        self.assertIn("continuousAnimation: false", self.runtime)
        self.assertIn("cancelAnimationFrame", self.runtime)
        self.assertNotIn("setInterval", self.runtime)
        self.assertNotIn("OrbitControls", self.runtime)
        self.assertNotIn("pointermove", self.runtime)
        self.assertNotRegex(self.runtime, r"requestAnimationFrame\([^)]*\)\s*;\s*requestAnimationFrame")

    def test_reduced_motion_and_fallback_are_complete(self) -> None:
        self.assertIn("prefers-reduced-motion: reduce", self.css)
        self.assertIn("data-fallback", self.css)
        self.assertIn("activateFallback", self.runtime)
        self.assertIn("settleImmediately", self.runtime)
        self.assertIn("reducedMotionQuery.matches", self.runtime)
        self.assertIn("outcome-volume__fallback", self.app)

    def test_responsive_art_direction_is_explicit(self) -> None:
        compact = re.sub(r"\s+", "", self.css)
        self.assertIn("@media(max-width:900px)", compact)
        self.assertIn("@media(max-width:560px)", compact)
        self.assertIn("aspect-ratio", self.css)
        self.assertIn("mobileCamera", self.runtime)
        self.assertIn("desktopCamera", self.runtime)

    def test_diagnostics_support_rendered_verification(self) -> None:
        for field in (
            "fieldCount",
            "meshCount",
            "settled",
            "fallbackActive",
            "reducedMotion",
            "continuousAnimation",
            "frameCount",
        ):
            self.assertIn(field, self.runtime)
        self.assertIn("window.__outcomeVolumeDiagnostics", self.runtime)


if __name__ == "__main__":
    unittest.main()
