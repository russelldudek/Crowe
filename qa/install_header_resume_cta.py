from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
CTA = '<a class="header-resume-cta" href="resume.html">View résumé <span aria-hidden="true">↗</span></a>'
ANCHOR = '<a href="#questions">Questions</a></nav>'


def main() -> None:
    source = INDEX.read_text(encoding="utf-8")
    if CTA not in source:
        if ANCHOR not in source:
            raise RuntimeError("Unable to locate the header navigation insertion point")
        source = source.replace(ANCHOR, f'<a href="#questions">Questions</a>{CTA}</nav>', 1)
    INDEX.write_text(source, encoding="utf-8")


if __name__ == "__main__":
    main()
