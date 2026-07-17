from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
TARGET = 'href="site-v4.css?v=20260717-4"'


def main() -> None:
    source = INDEX.read_text(encoding="utf-8")
    for previous in (
        'href="site-v4.css?v=20260716-2"',
        'href="site-v4.css?v=20260717-3"',
    ):
        source = source.replace(previous, TARGET)
    if TARGET not in source:
        raise RuntimeError("Unable to install the integrated-brand stylesheet cache key")
    INDEX.write_text(source, encoding="utf-8")


if __name__ == "__main__":
    main()
