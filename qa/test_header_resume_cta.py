from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class HeaderResumeCtaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.installer = (ROOT / "qa" / "install_header_resume_cta.py").read_text(encoding="utf-8")
        cls.entry = (ROOT / "site-v4.css").read_text(encoding="utf-8")
        cls.cta_css = (ROOT / "site-v9.css").read_text(encoding="utf-8")
        cls.cache = (ROOT / "qa" / "cache_bust_brand.py").read_text(encoding="utf-8")

    def test_installer_adds_resume_cta_to_header_navigation(self) -> None:
        self.assertIn('class="header-resume-cta"', self.installer)
        self.assertIn('href="resume.html"', self.installer)
        self.assertIn('View résumé', self.installer)
        self.assertIn('aria-hidden="true"', self.installer)

    def test_cta_styles_are_loaded_last_and_visually_distinct(self) -> None:
        self.assertIn("site-v9.css?v=20260717-1", self.entry)
        compact = re.sub(r"\s+", "", self.cta_css)
        self.assertRegex(compact, r"\.site-nav\.header-resume-cta\{[^}]*background:var\(--crowe-amber-core\)")
        self.assertRegex(compact, r"\.site-nav\.header-resume-cta\{[^}]*font-weight:900")
        self.assertRegex(compact, r"\.site-nav\.header-resume-cta\{[^}]*color:var\(--crowe-indigo-dark\)!important")

    def test_mobile_menu_promotes_resume_cta(self) -> None:
        compact = re.sub(r"\s+", "", self.cta_css)
        self.assertIn("@media(max-width:900px)", compact)
        self.assertRegex(compact, r"\.site-nav\.header-resume-cta\{[^}]*order:-1")
        self.assertRegex(compact, r"\.site-nav\.header-resume-cta\{[^}]*width:100%")

    def test_new_publication_cache_key_is_declared(self) -> None:
        self.assertIn('site-v4.css?v=20260717-5', self.cache)


if __name__ == "__main__":
    unittest.main()
