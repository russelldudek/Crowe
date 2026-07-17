from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class BrandRailSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.entry = (ROOT / "site-v4.css").read_text(encoding="utf-8")
        cls.brand = (ROOT / "site-v8.css").read_text(encoding="utf-8")
        cls.cache = (ROOT / "qa" / "cache_bust_brand.py").read_text(encoding="utf-8")

    def test_integrated_brand_styles_are_in_final_cascade(self) -> None:
        self.assertIn("site-v8.css?v=20260717-1", self.entry)

    def test_header_is_one_white_brand_rail(self) -> None:
        compact = re.sub(r"\s+", "", self.brand)
        self.assertRegex(compact, r"\.brand-mini\{[^}]*background:#fff")
        self.assertRegex(compact, r"\.brand-miniimg\{[^}]*background:transparent!important")
        self.assertRegex(compact, r"\.brand-minispan\{[^}]*color:#011e41!important")

    def test_duplicate_hero_logo_is_removed_visually(self) -> None:
        compact = re.sub(r"\s+", "", self.brand)
        self.assertRegex(compact, r"\.company-lockup\{[^}]*background:transparent!important")
        self.assertRegex(compact, r"\.company-lockupimg\{[^}]*display:none!important")
        self.assertRegex(compact, r"\.company-lockupsmall\{[^}]*border-left:3pxsolidvar\(--crowe-amber-core\)")

    def test_published_entrypoint_uses_new_cache_key(self) -> None:
        self.assertIn('site-v4.css?v=20260717-4', self.cache)


if __name__ == "__main__":
    unittest.main()
