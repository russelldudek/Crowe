const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

const lab = document.querySelector('.lab-stage');
const frame = document.querySelector('.scenario-workstream');
const buttons = [...document.querySelectorAll('[data-scenario]')];
const status = document.querySelector('#decision-status');
const copy = document.querySelector('#decision-copy');
const conditionNodes = frame
  ? [...frame.querySelectorAll('[data-condition]')]
  : [];

const allActive = {
  outcome: 'active',
  workflow: 'active',
  authority: 'active',
  evidence: 'active',
  ownership: 'active',
};

const states = {
  baseline: {
    status: 'ADVANCE — complete workstream',
    copy: 'The outcome, workflow, authority, evidence, integration, and client owner are explicit. Build the smallest production-worthy slice and instrument adoption from day one.',
    conditionStates: {...allActive},
    integrationState: 'active',
    ownershipState: 'closed',
    boundaryState: 'none',
  },
  speed: {
    status: 'REFRAME — fast is not yet complete',
    copy: 'Executive urgency is valid, but delivery speed without evidence and ownership turns a visible prototype into a hidden operating liability.',
    conditionStates: {...allActive, evidence: 'unresolved', ownership: 'unresolved'},
    integrationState: 'active',
    ownershipState: 'open',
    boundaryState: 'none',
  },
  agent: {
    status: 'BOUND — define the action envelope',
    copy: 'When an agent can act across systems, permissions, traceability, exception handling, human authority, and fallback become part of the product—not review paperwork.',
    conditionStates: {...allActive, authority: 'warning'},
    integrationState: 'active',
    ownershipState: 'closed',
    boundaryState: 'authority',
  },
  orphan: {
    status: 'HOLD — name the operating owner',
    copy: 'A technically successful pilot without a client owner, cadence, and adoption mechanism is an isolated result. Ownership is a delivery requirement.',
    conditionStates: {...allActive, ownership: 'unresolved'},
    integrationState: 'active',
    ownershipState: 'open',
    boundaryState: 'none',
  },
  legacy: {
    status: 'SEQUENCE — prove the integration boundary',
    copy: 'Where source systems or connectors are uncertain, test the boundary first. Platform selection should follow integration, control, and supportability evidence—not fashion.',
    conditionStates: {...allActive},
    integrationState: 'uncertain',
    ownershipState: 'closed',
    boundaryState: 'none',
  },
};

function setScenario(key) {
  const next = states[key];
  if (!lab || !frame || !status || !copy || !next) return;

  lab.dataset.state = key;
  frame.setAttribute('data-integration-state', next.integrationState);
  frame.setAttribute('data-ownership-state', next.ownershipState);
  frame.setAttribute('data-boundary-state', next.boundaryState);

  conditionNodes.forEach((node) => {
    const condition = node.getAttribute('data-condition');
    node.setAttribute(
      'data-condition-state',
      next.conditionStates[condition] || 'active',
    );
  });

  buttons.forEach((button) => {
    button.setAttribute(
      'aria-pressed',
      String(button.dataset.scenario === key),
    );
  });

  status.textContent = next.status;
  copy.textContent = next.copy;
}

buttons.forEach((button) => {
  button.addEventListener('click', () => setScenario(button.dataset.scenario));
});

const reset = document.querySelector('#reset-scenario');
if (reset) {
  reset.addEventListener('click', () => setScenario('baseline'));
}

setScenario('baseline');
