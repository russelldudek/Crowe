import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = process.env.CAMPAIGN_URL || 'http://127.0.0.1:4173/';
const viewports = [
  {name: 'desktop', width: 1440, height: 900},
  {name: 'laptop', width: 1280, height: 800},
  {name: 'tablet', width: 768, height: 1024},
  {name: 'mobile', width: 390, height: 844},
  {name: 'narrow', width: 320, height: 700},
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function nearlyEqual(a, b, tolerance = 1) {
  return Math.abs(a - b) <= tolerance;
}

function rectEqual(a, b, tolerance = 1) {
  return nearlyEqual(a.left, b.left, tolerance)
    && nearlyEqual(a.top, b.top, tolerance)
    && nearlyEqual(a.width, b.width, tolerance)
    && nearlyEqual(a.height, b.height, tolerance);
}

await fs.mkdir('qa/renders', {recursive: true});
const browser = await chromium.launch({headless: true});

for (const viewport of viewports) {
  const page = await browser.newPage({viewport});
  await page.goto(baseURL, {waitUntil: 'networkidle'});
  await page.waitForSelector('.outcome-strip--hero');
  await page.waitForTimeout(2800);

  const report = await page.evaluate(() => {
    const strip = document.querySelector('.outcome-strip--hero');
    const shell = strip.querySelector('.outcome-strip__shell');
    const bayGrid = strip.querySelector('.outcome-strip__bays');
    const bays = [...strip.querySelectorAll('.outcome-bay')];
    const foundation = strip.querySelector('.integration-foundation');
    const forming = strip.querySelector('.operating-state__forming');
    const owned = strip.querySelector('.operating-state__owned');
    const legacySelector = '.ownership-terminal,.continuity-rail,.boundary-bracket,.workstream-frame,.workstream-condition';

    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      strip: strip.getBoundingClientRect().toJSON(),
      shell: shell.getBoundingClientRect().toJSON(),
      foundation: foundation.getBoundingClientRect().toJSON(),
      columns: getComputedStyle(bayGrid).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      legacyCount: document.querySelectorAll(legacySelector).length,
      formingOpacity: Number(getComputedStyle(forming).opacity),
      ownedOpacity: Number(getComputedStyle(owned).opacity),
      bays: bays.map((bay) => ({
        name: bay.dataset.condition || bay.dataset.bay,
        rect: bay.getBoundingClientRect().toJSON(),
        overflow: bay.scrollWidth - bay.clientWidth,
        iteration: getComputedStyle(bay).animationIterationCount,
        text: [...bay.querySelectorAll('strong,small,.outcome-bay__state,.outcome-bay__eyebrow')].map((node) => ({
          value: node.textContent.trim(),
          rect: node.getBoundingClientRect().toJSON(),
          opacity: Number(getComputedStyle(node).opacity),
        })),
      })),
    };
  });

  assert(report.overflow <= 1, `${viewport.name}: horizontal overflow ${report.overflow}px`);
  assert(report.legacyCount === 0, `${viewport.name}: legacy geometry survived runtime replacement`);
  assert(report.bays.length === 6, `${viewport.name}: expected six permanent bays`);
  assert(nearlyEqual(report.foundation.left, report.shell.left), `${viewport.name}: foundation does not start at shell left`);
  assert(nearlyEqual(report.foundation.right, report.shell.right), `${viewport.name}: foundation does not end at shell right`);
  assert(report.formingOpacity === 0, `${viewport.name}: forming label remains after verification`);
  assert(report.ownedOpacity === 1, `${viewport.name}: Owned operation did not settle`);

  if (viewport.width > 900) assert(report.columns === 6, `${viewport.name}: expected six columns, got ${report.columns}`);
  if (viewport.width <= 900 && viewport.width > 560) assert(report.columns === 3, `${viewport.name}: expected three-column tablet grid, got ${report.columns}`);
  if (viewport.width <= 560) assert(report.columns === 1, `${viewport.name}: expected vertical mobile grid, got ${report.columns}`);

  for (const bay of report.bays) {
    assert(bay.rect.left >= report.shell.left - 1, `${viewport.name}: ${bay.name} escapes shell left`);
    assert(bay.rect.right <= report.shell.right + 1, `${viewport.name}: ${bay.name} escapes shell right`);
    assert(bay.overflow <= 1, `${viewport.name}: ${bay.name} overflows by ${bay.overflow}px`);
    assert(bay.iteration === '1' || bay.iteration === '1, 1', `${viewport.name}: ${bay.name} animation repeats`);

    for (const text of bay.text) {
      assert(text.value.length > 0, `${viewport.name}: ${bay.name} contains an empty label`);
      if (text.opacity === 0) continue;
      assert(text.rect.left >= bay.rect.left - 1, `${viewport.name}: ${bay.name} text escapes left`);
      assert(text.rect.right <= bay.rect.right + 1, `${viewport.name}: ${bay.name} text escapes right`);
      assert(text.rect.top >= bay.rect.top - 1, `${viewport.name}: ${bay.name} text escapes top`);
      assert(text.rect.bottom <= bay.rect.bottom + 1, `${viewport.name}: ${bay.name} text escapes bottom`);
    }
  }

  await page.screenshot({
    path: `qa/renders/outcome-span-${viewport.name}.png`,
    fullPage: false,
  });
  await page.close();
}

const motionPage = await browser.newPage({viewport: {width: 1280, height: 800}});
await motionPage.goto(baseURL, {waitUntil: 'networkidle'});
await motionPage.waitForSelector('.outcome-strip--hero');

async function sampleHeroGeometry() {
  return motionPage.evaluate(() => {
    const strip = document.querySelector('.outcome-strip--hero');
    return [...strip.querySelectorAll('.outcome-bay')].map((bay) => ({
      name: bay.dataset.condition || bay.dataset.bay,
      rect: bay.getBoundingClientRect().toJSON(),
    }));
  });
}

const baselineGeometry = await sampleHeroGeometry();
let elapsed = 0;
for (const timestamp of [300, 750, 1250, 1850, 2450]) {
  await motionPage.waitForTimeout(timestamp - elapsed);
  elapsed = timestamp;
  const current = await sampleHeroGeometry();
  current.forEach((bay, index) => {
    assert(
      rectEqual(bay.rect, baselineGeometry[index].rect),
      `${timestamp}ms: ${bay.name} bounds changed during verification`,
    );
  });
}
await motionPage.close();

const interactionPage = await browser.newPage({viewport: {width: 1280, height: 800}});
await interactionPage.goto(baseURL, {waitUntil: 'networkidle'});
await interactionPage.waitForSelector('.outcome-strip--scenario');

const expected = {
  baseline: {decision: 'ADVANCE', evidence: 'active', authority: 'active', ownership: 'active', integration: 'active', operating: 'advance'},
  speed: {decision: 'REFRAME', evidence: 'unresolved', authority: 'active', ownership: 'unresolved', integration: 'active', operating: 'reframe'},
  agent: {decision: 'BOUND', evidence: 'active', authority: 'warning', ownership: 'active', integration: 'active', operating: 'bound'},
  orphan: {decision: 'HOLD', evidence: 'active', authority: 'active', ownership: 'unresolved', integration: 'active', operating: 'hold'},
  legacy: {decision: 'SEQUENCE', evidence: 'active', authority: 'active', ownership: 'active', integration: 'uncertain', operating: 'sequence'},
};

async function readScenario() {
  return interactionPage.evaluate(() => {
    const strip = document.querySelector('.outcome-strip--scenario');
    const condition = (name) => strip.querySelector(`[data-condition="${name}"]`);
    const bays = [...strip.querySelectorAll('.outcome-bay')];
    return {
      decision: document.querySelector('#decision-status').textContent,
      evidence: condition('evidence').dataset.conditionState,
      authority: condition('authority').dataset.conditionState,
      ownership: condition('ownership').dataset.conditionState,
      integration: strip.querySelector('.integration-foundation').dataset.integrationState,
      operating: strip.querySelector('[data-bay="operating-state"]').dataset.operatingState,
      stateLabels: [...strip.querySelectorAll('.outcome-bay__state,.integration-foundation__state,.operating-state__label')]
        .map((node) => node.textContent.trim()),
      rects: bays.map((bay) => bay.getBoundingClientRect().toJSON()),
    };
  });
}

const baselineScenario = await readScenario();

for (const [scenario, state] of Object.entries(expected)) {
  await interactionPage.click(`[data-scenario="${scenario}"]`);
  await interactionPage.waitForTimeout(240);
  const result = await readScenario();
  assert(result.decision.startsWith(state.decision), `${scenario}: wrong decision ${result.decision}`);
  assert(result.evidence === state.evidence, `${scenario}: evidence expected ${state.evidence}, got ${result.evidence}`);
  assert(result.authority === state.authority, `${scenario}: authority expected ${state.authority}, got ${result.authority}`);
  assert(result.ownership === state.ownership, `${scenario}: ownership expected ${state.ownership}, got ${result.ownership}`);
  assert(result.integration === state.integration, `${scenario}: integration expected ${state.integration}, got ${result.integration}`);
  assert(result.operating === state.operating, `${scenario}: operating expected ${state.operating}, got ${result.operating}`);
  assert(result.stateLabels.every(Boolean), `${scenario}: semantic state label is empty`);
  result.rects.forEach((rect, index) => {
    assert(rectEqual(rect, baselineScenario.rects[index]), `${scenario}: bay ${index + 1} geometry changed`);
  });
}

await interactionPage.focus('[data-scenario="speed"]');
await interactionPage.keyboard.press('Enter');
assert(
  (await interactionPage.textContent('#decision-status')).startsWith('REFRAME'),
  'keyboard activation failed',
);

await interactionPage.click('[data-scenario="agent"]');
await interactionPage.click('[data-scenario="legacy"]');
await interactionPage.click('[data-scenario="orphan"]');
assert(
  (await interactionPage.textContent('#decision-status')).startsWith('HOLD'),
  'rapid selection did not settle on final state',
);

await interactionPage.click('#reset-scenario');
assert(
  (await interactionPage.textContent('#decision-status')).startsWith('ADVANCE'),
  'reset did not restore the baseline',
);
await interactionPage.close();

const reducedPage = await browser.newPage({
  viewport: {width: 390, height: 844},
  reducedMotion: 'reduce',
});
await reducedPage.goto(baseURL, {waitUntil: 'networkidle'});
await reducedPage.waitForSelector('.outcome-strip--hero');
const reduced = await reducedPage.evaluate(() => {
  const strip = document.querySelector('.outcome-strip--hero');
  return {
    items: [...strip.querySelectorAll('.outcome-bay,.integration-foundation,.operating-state__forming,.operating-state__owned')].map((node) => ({
      animation: getComputedStyle(node).animationName,
      transition: getComputedStyle(node).transitionDuration,
    })),
    formingOpacity: Number(getComputedStyle(strip.querySelector('.operating-state__forming')).opacity),
    ownedOpacity: Number(getComputedStyle(strip.querySelector('.operating-state__owned')).opacity),
  };
});

for (const item of reduced.items) {
  assert(item.animation === 'none', `reduced motion animation remains: ${item.animation}`);
  assert(item.transition === '0s', `reduced motion transition remains: ${item.transition}`);
}
assert(reduced.formingOpacity === 0, 'reduced motion leaves Workstream forming visible');
assert(reduced.ownedOpacity === 1, 'reduced motion does not show Owned operation');
await reducedPage.close();

await browser.close();
console.log('Outcome Span rendered regression: PASS');
