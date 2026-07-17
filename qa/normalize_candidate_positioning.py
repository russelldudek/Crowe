from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"


def replace_once(source: str, old: str, new: str, label: str) -> str:
    count = source.count(old)
    if count == 0:
        if new in source:
            return source
        raise RuntimeError(f"Missing expected homepage fragment: {label}")
    if count != 1:
        raise RuntimeError(f"Expected one homepage fragment for {label}, found {count}")
    return source.replace(old, new, 1)


def normalize() -> None:
    source = INDEX.read_text(encoding="utf-8")

    source = source.replace(
        'href="site-v3.css?v=20260716-2"',
        'href="site-v4.css?v=20260716-2"',
    )

    source = replace_once(
        source,
        '<p class="claim-note">Evidence boundary: this campaign does not claim prior Crowe delivery, undisclosed client work, or verified production tenure in every platform named in the posting. It demonstrates a transferable operating system and proposes a concrete way to prove platform judgment through a role-specific working session.</p>',
        '',
        'candidate-facing evidence disclaimer',
    )

    source = replace_once(
        source,
        '<li>Build confidence in Power Platform and adjacent automation choices through supervised architecture and hands-on configuration.</li>',
        '<li>Apply Crowe’s Power Platform and adjacent automation patterns directly within a bounded client workstream, using architecture review to align quickly with practice standards.</li>',
        'entry-plan platform language',
    )

    old_section = '<section class="section dark"><div class="wrap"><div class="section-kicker">Strongest reasonable hiring question</div><h2>Can Russell convert broad AI and operating depth into Crowe’s preferred low-code delivery stack quickly enough?</h2><div class="objection-band"><div class="risk">That is the right question. Tool-name familiarity is not interchangeable with production judgment, and the posting explicitly expects advanced low-code architecture.</div><div class="answer">My affirmative case is not “I have used everything.” It is that I already work directly in the underlying decisions: workflow decomposition, data and API boundaries, agent behavior, human authority, evaluation, governance, adoption, and operating ownership. I would make the remaining platform-specific proof observable early through a 60–90 minute architecture working session and a bounded build: compare Power Platform, n8n, Make, and Zapier against one real workflow’s connector fit, autonomy ceiling, governance, reuse, supportability, and time-to-value; then configure the selected path under Crowe’s standards.</div></div><div class="cta-row"><a class="button" href="objection-analysis.html">Review the technical-value case</a><a class="button secondary" href="interview-brief.html">Open the interview thesis brief</a></div></div></section>'
    new_section = '<section class="section dark"><div class="wrap"><div class="section-kicker">Technical contribution</div><h2>Platform judgment anchored in the work.</h2><div class="objection-band"><div class="risk">I evaluate automation platforms through the workflow they must support: connector fit, data model, authority, governance, observability, reuse, supportability, and time-to-value.</div><div class="answer">That approach keeps technology choices connected to client outcomes. It combines hands-on workflow design, API and data reasoning, agent behavior, evaluation, adoption, and operating ownership—then turns delivery learning into reusable practice capability.</div></div><div class="cta-row"><a class="button" href="interview-brief.html">Open the interview thesis brief</a><a class="button secondary" href="fde-workstream-review.html">Review the delivery artifact</a></div></div></section>'
    source = replace_once(source, old_section, new_section, 'homepage objection section')

    INDEX.write_text(source, encoding="utf-8")


if __name__ == "__main__":
    normalize()
