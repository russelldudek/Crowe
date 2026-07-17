const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

const OUTCOME_STYLESHEET = 'site-v5.css?v=20260717-1';
const VOLUME_STYLESHEET = 'site-v6.css?v=20260717-1';
const VOLUME_MODULE = './three-outcome-volume.js?v=20260717-1';

function ensureStylesheet(href, marker) {
  const existing = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .find(link => link.getAttribute('href')?.includes(marker));
  if (existing) return Promise.resolve();

  return new Promise(resolve => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.addEventListener('load', resolve, {once: true});
    link.addEventListener('error', resolve, {once: true});
    document.head.appendChild(link);
  });
}

function buildOutcomeVolumeStage() {
  const stage = document.createElement('div');
  stage.className = 'outcome-volume-stage';
  stage.dataset.state = 'loading';
  stage.dataset.fallback = 'false';
  stage.setAttribute(
    'aria-label',
    'Outcome Volume: five operating fields align over an integration foundation and resolve into one owned operation',
  );
  stage.innerHTML = `
    <div class="outcome-volume__kicker">The Outcome Volume · intent resolving into owned operation</div>
    <div class="outcome-volume__viewport">
      <canvas class="outcome-volume__canvas" aria-hidden="true"></canvas>
      <div class="outcome-volume__fallback" role="img" aria-label="Five indigo operating fields aligned over a shared integration foundation and joined by an amber continuity seam">
        <div class="outcome-volume__fallback-assembly">
          <div class="outcome-volume__fallback-fields" aria-hidden="true">
            <span class="outcome-volume__fallback-field"></span>
            <span class="outcome-volume__fallback-field"></span>
            <span class="outcome-volume__fallback-field"></span>
            <span class="outcome-volume__fallback-field"></span>
            <span class="outcome-volume__fallback-field"></span>
          </div>
          <span class="outcome-volume__fallback-foundation" aria-hidden="true"></span>
          <span class="outcome-volume__fallback-seam" aria-hidden="true"></span>
        </div>
      </div>
      <div class="outcome-volume__caption" aria-hidden="true">
        <span>Five conditions align</span>
        <strong>One owned operation</strong>
      </div>
      <span class="outcome-volume__status" role="status" aria-live="polite">Aligning five operating fields.</span>
    </div>
  `;
  return stage;
}

function buildScenarioStrip() {
  const strip = document.createElement('div');
  strip.className = 'outcome-strip outcome-strip--scenario';
  strip.dataset.scenario = 'baseline';
  strip.setAttribute('aria-label', 'Scenario workstream conditions');
  strip.innerHTML = `
    <div class="outcome-strip__shell">
      <ol class="outcome-strip__bays">
        <li class="outcome-bay" data-condition="outcome" data-condition-state="active">
          <strong>Outcome</strong><small>Explicit</small><span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay" data-condition="workflow" data-condition-state="active">
          <strong>Workflow</strong><small>Embedded</small><span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay" data-condition="authority" data-condition-state="active">
          <strong>Authority</strong><small>Bounded</small><span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay" data-condition="evidence" data-condition-state="active">
          <strong>Evidence</strong><small>Instrumented</small><span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay" data-condition="ownership" data-condition-state="active">
          <strong>Ownership</strong><small>Named</small><span class="outcome-bay__state">Confirmed</span>
        </li>
        <li class="outcome-bay outcome-bay--operating" data-bay="operating-state" data-operating-state="advance">
          <span class="outcome-bay__eyebrow">Operating state</span>
          <strong class="operating-state__decision">ADVANCE</strong>
          <small class="operating-state__label">Owned operation</small>
        </li>
      </ol>
      <div class="integration-foundation" data-integration-state="active">
        <strong>Integration foundation</strong>
        <span class="integration-foundation__detail">data · APIs · connectors · security</span>
        <span class="integration-foundation__state">Confirmed</span>
      </div>
    </div>
  `;
  return strip;
}

function replaceOutcomeSpanMarkup() {
  if (!document.querySelector('.outcome-volume-stage')) {
    const legacyHero = document.querySelector('.hero-workstream');
    if (legacyHero) legacyHero.replaceWith(buildOutcomeVolumeStage());
  }

  if (!document.querySelector('.outcome-strip--scenario')) {
    const legacyScenario = document.querySelector('.scenario-workstream');
    if (legacyScenario) legacyScenario.replaceWith(buildScenarioStrip());
  }
}

function showOutcomeVolumeFallback(stage) {
  if (!stage) return;
  stage.dataset.fallback = 'true';
  stage.dataset.state = 'settled';
  const status = stage.querySelector('.outcome-volume__status');
  if (status) status.textContent = 'Five operating fields aligned into one owned operation.';
  window.__outcomeVolumeDiagnostics = {
    fieldCount: 5,
    meshCount: 10,
    settled: true,
    fallbackActive: true,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    continuousAnimation: false,
    frameCount: 0,
    phase: 'fallback',
  };
}

async function loadOutcomeVolume() {
  const stage = document.querySelector('.outcome-volume-stage');
  if (!stage) return;
  await ensureStylesheet(VOLUME_STYLESHEET, 'site-v6.css');
  try {
    const module = await import(VOLUME_MODULE);
    module.initOutcomeVolume(stage);
  } catch (error) {
    showOutcomeVolumeFallback(stage);
  }
}

ensureStylesheet(OUTCOME_STYLESHEET, 'site-v5.css');
replaceOutcomeSpanMarkup();
loadOutcomeVolume();

const lab = document.querySelector('.lab-stage');
const strip = document.querySelector('.outcome-strip--scenario');
const buttons = [...document.querySelectorAll('[data-scenario]')];
const status = document.querySelector('#decision-status');
const copy = document.querySelector('#decision-copy');
const conditionNodes = strip ? [...strip.querySelectorAll('[data-condition]')] : [];
const integration = strip?.querySelector('.integration-foundation');
const integrationStateLabel = integration?.querySelector('.integration-foundation__state');
const operatingBay = strip?.querySelector('[data-bay="operating-state"]');
const operatingDecision = operatingBay?.querySelector('.operating-state__decision');
const operatingLabel = operatingBay?.querySelector('.operating-state__label');

const allActive = {
  outcome: 'active',
  workflow: 'active',
  authority: 'active',
  evidence: 'active',
  ownership: 'active',
};

const confirmedLabels = {
  outcome: 'Confirmed',
  workflow: 'Confirmed',
  authority: 'Confirmed',
  evidence: 'Confirmed',
  ownership: 'Confirmed',
};

const states = {
  baseline: {
    status: 'ADVANCE — complete workstream',
    copy: 'The outcome, workflow, authority, evidence, integration, and client owner are explicit. Build the smallest production-worthy slice and instrument adoption from day one.',
    conditionStates: {...allActive},
    conditionLabels: {...confirmedLabels},
    integrationState: 'active',
    integrationLabel: 'Confirmed',
    operatingState: 'advance',
    operatingLabel: 'Owned operation',
  },
  speed: {
    status: 'REFRAME — fast is not yet complete',
    copy: 'Executive urgency is valid, but delivery speed without evidence and ownership turns a visible prototype into a hidden operating liability.',
    conditionStates: {...allActive, evidence: 'unresolved', ownership: 'unresolved'},
    conditionLabels: {...confirmedLabels, evidence: 'Proof unresolved', ownership: 'Owner unresolved'},
    integrationState: 'active',
    integrationLabel: 'Confirmed',
    operatingState: 'reframe',
    operatingLabel: 'Proof and owner required',
  },
  agent: {
    status: 'BOUND — define the action envelope',
    copy: 'When an agent can act across systems, permissions, traceability, exception handling, human authority, and fallback become part of the product—not review paperwork.',
    conditionStates: {...allActive, authority: 'warning'},
    conditionLabels: {...confirmedLabels, authority: 'Boundary required'},
    integrationState: 'active',
    integrationLabel: 'Confirmed',
    operatingState: 'bound',
    operatingLabel: 'Action envelope required',
  },
  orphan: {
    status: 'HOLD — name the operating owner',
    copy: 'A technically successful pilot without a client owner, cadence, and adoption mechanism is an isolated result. Ownership is a delivery requirement.',
    conditionStates: {...allActive, ownership: 'unresolved'},
    conditionLabels: {...confirmedLabels, ownership: 'Owner unresolved'},
    integrationState: 'active',
    integrationLabel: 'Confirmed',
    operatingState: 'hold',
    operatingLabel: 'Operating owner required',
  },
  legacy: {
    status: 'SEQUENCE — prove the integration boundary',
    copy: 'Where source systems or connectors are uncertain, test the boundary first. Platform selection should follow integration, control, and supportability evidence—not fashion.',
    conditionStates: {...allActive},
    conditionLabels: {...confirmedLabels},
    integrationState: 'uncertain',
    integrationLabel: 'Boundary uncertain',
    operatingState: 'sequence',
    operatingLabel: 'Prove integration first',
  },
};

function setScenario(key) {
  const next = states[key];
  if (
    !lab
    || !strip
    || !status
    || !copy
    || !integration
    || !integrationStateLabel
    || !operatingBay
    || !operatingDecision
    || !operatingLabel
    || !next
  ) return;

  lab.dataset.state = key;
  strip.dataset.scenario = key;
  integration.dataset.integrationState = next.integrationState;
  integrationStateLabel.textContent = next.integrationLabel;
  operatingBay.dataset.operatingState = next.operatingState;
  operatingDecision.textContent = next.status.split(' — ')[0];
  operatingLabel.textContent = next.operatingLabel;

  conditionNodes.forEach(node => {
    const condition = node.dataset.condition;
    node.dataset.conditionState = next.conditionStates[condition] || 'active';
    const label = node.querySelector('.outcome-bay__state');
    if (label) label.textContent = next.conditionLabels[condition] || 'Confirmed';
  });

  buttons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.scenario === key));
  });

  status.textContent = next.status;
  copy.textContent = next.copy;
}

buttons.forEach(button => {
  button.addEventListener('click', () => setScenario(button.dataset.scenario));
});

const reset = document.querySelector('#reset-scenario');
if (reset) reset.addEventListener('click', () => setScenario('baseline'));

setScenario('baseline');
