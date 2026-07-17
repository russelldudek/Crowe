from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(source: str, old: str, new: str, label: str) -> str:
    count = source.count(old)
    if count == 0:
        if new in source:
            return source
        raise RuntimeError(f"Missing expected fragment: {label}")
    if count != 1:
        raise RuntimeError(f"Expected one fragment for {label}, found {count}")
    return source.replace(old, new, 1)


def update_file(name: str, replacements: list[tuple[str, str, str]]) -> None:
    path = ROOT / name
    source = path.read_text(encoding="utf-8")
    for old, new, label in replacements:
        source = replace_once(source, old, new, f"{name}: {label}")
    path.write_text(source, encoding="utf-8")


def normalize() -> None:
    index = ROOT / "index.html"
    source = index.read_text(encoding="utf-8")
    source = source.replace(
        'href="site-v3.css?v=20260716-2"',
        'href="site-v4.css?v=20260717-3"',
    )
    source = source.replace(
        'href="site-v4.css?v=20260716-2"',
        'href="site-v4.css?v=20260717-3"',
    )
    source = replace_once(
        source,
        '<p class="claim-note">Evidence boundary: this campaign does not claim prior Crowe delivery, undisclosed client work, or verified production tenure in every platform named in the posting. It demonstrates a transferable operating system and proposes a concrete way to prove platform judgment through a role-specific working session.</p>',
        '',
        'index.html: candidate-facing evidence disclaimer',
    )
    source = replace_once(
        source,
        '<li>Build confidence in Power Platform and adjacent automation choices through supervised architecture and hands-on configuration.</li>',
        '<li>Apply Crowe’s Power Platform and adjacent automation patterns directly within a bounded client workstream, using architecture review to align quickly with practice standards.</li>',
        'index.html: entry-plan platform language',
    )
    old_section = '<section class="section dark"><div class="wrap"><div class="section-kicker">Strongest reasonable hiring question</div><h2>Can Russell convert broad AI and operating depth into Crowe’s preferred low-code delivery stack quickly enough?</h2><div class="objection-band"><div class="risk">That is the right question. Tool-name familiarity is not interchangeable with production judgment, and the posting explicitly expects advanced low-code architecture.</div><div class="answer">My affirmative case is not “I have used everything.” It is that I already work directly in the underlying decisions: workflow decomposition, data and API boundaries, agent behavior, human authority, evaluation, governance, adoption, and operating ownership. I would make the remaining platform-specific proof observable early through a 60–90 minute architecture working session and a bounded build: compare Power Platform, n8n, Make, and Zapier against one real workflow’s connector fit, autonomy ceiling, governance, reuse, supportability, and time-to-value; then configure the selected path under Crowe’s standards.</div></div><div class="cta-row"><a class="button" href="objection-analysis.html">Review the technical-value case</a><a class="button secondary" href="interview-brief.html">Open the interview thesis brief</a></div></div></section>'
    new_section = '<section class="section dark"><div class="wrap"><div class="section-kicker">Technical contribution</div><h2>Platform judgment anchored in the work.</h2><div class="objection-band"><div class="risk">I evaluate automation platforms through the workflow they must support: connector fit, data model, authority, governance, observability, reuse, supportability, and time-to-value.</div><div class="answer">That approach keeps technology choices connected to client outcomes. It combines hands-on workflow design, API and data reasoning, agent behavior, evaluation, adoption, and operating ownership—then turns delivery learning into reusable practice capability.</div></div><div class="cta-row"><a class="button" href="interview-brief.html">Open the interview thesis brief</a><a class="button secondary" href="fde-workstream-review.html">Review the delivery artifact</a></div></div></section>'
    source = replace_once(source, old_section, new_section, 'index.html: objection section')
    index.write_text(source, encoding="utf-8")

    update_file(
        "resume.html",
        [
            (
                'Academic grounding includes materials science, physical chemistry, and biology-related studies. Academic work is indexed at <a href="https://scholar.google.com/citations?user=yHQSVd8AAAAJ&amp;hl=en">Google Scholar</a>.',
                'STEM · Academic and industrial publications indexed at <a href="https://scholar.google.com/citations?user=yHQSVd8AAAAJ&amp;hl=en">Google Scholar</a>.',
                'education and publications language',
            ),
            (
                '<span>Food Safety Management Certification</span>',
                '',
                'irrelevant food-safety credential',
            ),
        ],
    )

    update_file(
        "cover-letter.html",
        [
            (
                '<p>The posting’s emphasis on Power Platform and adjacent low-code tools deserves evidence, not keyword matching. My verified strength is in the underlying architecture and operating choices—workflow decomposition, data and API boundaries, agent behavior, human authority, evaluation, governance, adoption, and supportability. I would welcome a practical architecture working session or bounded build to demonstrate how I learn and apply Crowe’s preferred stack.</p>',
                '<p>My platform judgment starts with the work: connector fit, data and API boundaries, action authority, governance, evaluation, supportability, adoption, and time-to-value. That discipline helps teams choose and configure automation mechanisms that can move from proof into durable client operation.</p>',
                'platform paragraph',
            ),
        ],
    )

    update_file(
        "interview-brief.html",
        [
            (
                '<section class="doc-section"><h2>Strongest reasonable concern · internal hiring logic</h2><p><strong>Question:</strong> Does Russell have enough verified tenure in Crowe’s preferred Microsoft Power Platform and emerging low-code automation stack to operate independently at the expected level?</p><p><strong>Affirmative response:</strong> Russell’s verified evidence is strongest in the invariant architecture and operating decisions: workflow decomposition, data/API boundaries, agent behavior, human authority, evaluation, governance, adoption, and supportability. Prove the remaining platform-specific depth early through a live architecture comparison and bounded configuration exercise under Crowe standards. Do not inflate a résumé with unverified tool tenure.</p></section>',
                '<section class="doc-section"><h2>Contribution architecture</h2><p><strong>Operating judgment:</strong> Translate ambiguous demand into a clear workflow outcome, action envelope, evidence standard, adoption path, and accountable owner.</p><p><strong>Technical execution:</strong> Work directly across context, data and API boundaries, agent behavior, integration choices, evaluation, governance, supportability, and delivery decisions.</p></section>',
                'internal concern section',
            ),
            (
                '<section class="doc-section"><h2>Proposed technical working session</h2><div class="artifact-check"><div><strong>1 · Workflow</strong><p>Choose a client task with real users, inputs, actions, exceptions, and outcome.</p></div><div><strong>2 · Platforms</strong><p>Compare Power Platform, n8n, Make, and Zapier where appropriate.</p></div><div><strong>3 · Criteria</strong><p>Connector fit, data model, autonomy ceiling, governance, reuse, supportability, time-to-value.</p></div><div><strong>4 · Design</strong><p>Sketch tools, prompts/context, human checkpoints, fallback, evals, logs.</p></div><div><strong>5 · Proof</strong><p>Build a bounded slice and explain tradeoffs, not just configuration steps.</p></div></div></section>',
                '<section class="doc-section"><h2>How I create delivery leverage</h2><div class="artifact-check"><div><strong>1 · Frame</strong><p>Clarify the outcome, users, workflow, exceptions, and definition of value.</p></div><div><strong>2 · Architect</strong><p>Connect context, data, APIs, tools, permissions, and operating constraints.</p></div><div><strong>3 · Bound</strong><p>Define human authority, escalation, fallback, security, and traceability.</p></div><div><strong>4 · Prove</strong><p>Build a useful slice with acceptance cases, logs, adoption signals, and economics.</p></div><div><strong>5 · Transfer</strong><p>Install ownership, support, cadence, and reusable practice learning.</p></div></div></section>',
                'technical working session',
            ),
            (
                '<section class="doc-section"><h2>Contribution posture</h2><div class="decision-box"><strong>Builder-consultant, not tool collector.</strong><p>Work directly in discovery, workflow and prompt design, integration reasoning, testing, client workshops, evidence, and adoption—while learning Crowe’s preferred stack quickly and transparently.</p></div></section>',
                '<section class="doc-section"><h2>Contribution posture</h2><div class="decision-box"><strong>Builder-consultant who turns architecture decisions into operating results.</strong><p>Work directly in discovery, workflow and prompt design, integration reasoning, testing, client workshops, evidence, adoption, and ownership within Crowe’s delivery standards and preferred platform ecosystem.</p></div></section>',
                'contribution posture',
            ),
            (
                '<section class="doc-section"><h2>Evidence integrity</h2><p>All career facts are limited to verified candidate evidence. Company-specific operating ideas are based on public information or clearly labeled as hypotheses for discovery. No undisclosed Crowe process, client relationship, platform tenure, deployment, metric, or ownership is claimed.</p></section>',
                '<section class="doc-section"><h2>Evidence integrity</h2><p>Career evidence is grounded in verified experience. Company-specific operating ideas are based on public information and presented as hypotheses for discovery with Crowe Studio leadership and delivery teams.</p></section>',
                'evidence integrity',
            ),
        ],
    )

    update_file(
        "90-day-plan.html",
        [
            (
                '<p>Understand Crowe’s methods, platforms, estimation, governance, and global delivery interfaces by applying them under experienced review.</p>',
                '<p>Apply Crowe’s methods, platforms, estimation, governance, and global delivery interfaces directly in active work and established quality reviews.</p>',
                'entry principle review language',
            ),
            (
                '<p>Specific gaps, exercises, mentors, and proof points.</p>',
                '<p>Priority platform patterns, practice resources, and applied proof points.</p>',
                'platform plan language',
            ),
            (
                '<tr><td>Overextending before platform fluency is proven</td><td>Pair early, use bounded scope, request direct review, and make learning evidence explicit.</td></tr>',
                '<tr><td>Fragmented delivery across outcome, build, and adoption</td><td>Use one workstream record, bounded scope, explicit decision rights, and evidence tied to the client workflow.</td></tr>',
                'candidate-specific risk row',
            ),
        ],
    )

    update_file(
        "fde-workstream-review.html",
        [
            (
                '<p class="document-subtitle">A lightweight decision record for keeping rapid AI delivery connected to value, control, evidence, integration, adoption, and ownership. Adapt or retire it against Crowe’s actual methodology.</p>',
                '<p class="document-subtitle">A lightweight decision record for keeping rapid AI delivery connected to value, control, evidence, integration, adoption, and ownership. Designed to complement Crowe’s established delivery methodology.</p>',
                'artifact positioning',
            ),
        ],
    )


if __name__ == "__main__":
    normalize()
