import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = process.env.CAMPAIGN_URL || 'http://127.0.0.1:4173/';
const expectedLabels = ['Outcome', 'Workflow', 'Authority', 'Evidence', 'Ownership'];
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

function isWhite(value) {
  return value === 'rgb(255, 255, 255)' || value === 'rgba(255, 255, 255, 1)';
}

function isTransparent(value) {
  return value === 'rgba(0, 0, 0, 0)' || value === 'transparent';
}

await fs.mkdir('qa/renders/three-outcome-volume', {recursive: true});
const browser = await chromium.launch({headless: true});

for (const viewport of viewports) {
  const page = await browser.newPage({viewport});
  const errors = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(baseURL, {waitUntil: 'networkidle'});
  await page.waitForSelector('.outcome-volume-stage');

  const early = await page.evaluate(() => {
    const stage = document.querySelector('.outcome-volume-stage');
    const rect = stage.getBoundingClientRect();
    return {width: rect.width, height: rect.height};
  });

  await page.waitForTimeout(3400);

  const report = await page.evaluate(() => {
    const stage = document.querySelector('.outcome-volume-stage');
    const canvas = stage.querySelector('canvas');
    const fallback = stage.querySelector('.outcome-volume__fallback');
    const scenario = document.querySelector('.outcome-strip--scenario');
    const rect = stage.getBoundingClientRect();
    const canvasRect = canvas?.getBoundingClientRect();
    const fallbackRect = fallback?.getBoundingClientRect();
    const diagnostics = window.__outcomeVolumeDiagnostics || null;
    const headerRail = document.querySelector('.brand-mini');
    const headerLogo = document.querySelector('.brand-mini img');
    const heroLockup = document.querySelector('.company-lockup');
    const heroLogo = document.querySelector('.company-lockup img');
    const heroQualifier = document.querySelector('.company-lockup small');
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      stageRect: rect.toJSON(),
      canvasRect: canvasRect?.toJSON() || null,
      fallbackRect: fallbackRect?.toJSON() || null,
      fallbackDisplay: fallback ? getComputedStyle(fallback).display : 'missing',
      scenarioPresent: Boolean(scenario),
      diagnostics,
      brandTreatment: {
        headerRailBackground: headerRail ? getComputedStyle(headerRail).backgroundColor : 'missing',
        headerLogoBackground: headerLogo ? getComputedStyle(headerLogo).backgroundColor : 'missing',
        heroLockupBackground: heroLockup ? getComputedStyle(heroLockup).backgroundColor : 'missing',
        heroLogoDisplay: heroLogo ? getComputedStyle(heroLogo).display : 'missing',
        heroQualifierDisplay: heroQualifier ? getComputedStyle(heroQualifier).display : 'missing',
        heroQualifierBorder: heroQualifier ? getComputedStyle(heroQualifier).borderLeftWidth : 'missing',
      },
      currentSize: {width: rect.width, height: rect.height},
    };
  });

  assert(report.overflow <= 1, `${viewport.name}: horizontal overflow ${report.overflow}px`);
  assert(report.scenarioPresent, `${viewport.name}: interactive Outcome Span was removed`);
  assert(report.diagnostics, `${viewport.name}: diagnostics unavailable`);
  assert(report.diagnostics.fieldCount === 5, `${viewport.name}: expected five fields`);
  assert(report.diagnostics.labelCount === 5, `${viewport.name}: expected five labels`);
  assert(
    JSON.stringify(report.diagnostics.fieldLabels) === JSON.stringify(expectedLabels),
    `${viewport.name}: field labels are ${JSON.stringify(report.diagnostics.fieldLabels)}`,
  );
  assert(report.diagnostics.settled === true, `${viewport.name}: scene did not settle`);
  assert(report.diagnostics.continuousAnimation === false, `${viewport.name}: scene kept animating`);
  assert(report.diagnostics.meshCount >= 15, `${viewport.name}: named scene is structurally too sparse`);
  assert(Math.abs(report.currentSize.width - early.width) <= 1, `${viewport.name}: stage width changed during motion`);
  assert(Math.abs(report.currentSize.height - early.height) <= 1, `${viewport.name}: stage height changed during motion`);
  assert(isWhite(report.brandTreatment.headerRailBackground), `${viewport.name}: header brand rail is ${report.brandTreatment.headerRailBackground}`);
  assert(isTransparent(report.brandTreatment.headerLogoBackground), `${viewport.name}: header logo has a nested card ${report.brandTreatment.headerLogoBackground}`);
  assert(isTransparent(report.brandTreatment.heroLockupBackground), `${viewport.name}: duplicate hero logo card remains ${report.brandTreatment.heroLockupBackground}`);
  assert(report.brandTreatment.heroLogoDisplay === 'none', `${viewport.name}: duplicate hero logo remains visible`);
  assert(report.brandTreatment.heroQualifierDisplay !== 'none', `${viewport.name}: hero qualifier is hidden`);
  assert(parseFloat(report.brandTreatment.heroQualifierBorder) >= 3, `${viewport.name}: hero qualifier lost its amber rule`);

  const visibleRect = report.diagnostics.fallbackActive ? report.fallbackRect : report.canvasRect;
  assert(visibleRect, `${viewport.name}: no visible canvas or fallback`);
  assert(visibleRect.left >= report.stageRect.left - 1, `${viewport.name}: visual escapes stage left`);
  assert(visibleRect.right <= report.stageRect.right + 1, `${viewport.name}: visual escapes stage right`);
  assert(visibleRect.top >= report.stageRect.top - 1, `${viewport.name}: visual escapes stage top`);
  assert(visibleRect.bottom <= report.stageRect.bottom + 1, `${viewport.name}: visual escapes stage bottom`);
  assert(errors.length === 0, `${viewport.name}: browser errors: ${errors.join(' | ')}`);

  await page.screenshot({
    path: `qa/renders/three-outcome-volume/${viewport.name}.png`,
    fullPage: false,
  });

  const stage = page.locator('.outcome-volume-stage');
  await stage.scrollIntoViewIfNeeded();
  await stage.screenshot({
    path: `qa/renders/three-outcome-volume/${viewport.name}-component.png`,
  });

  await page.close();
}

const reducedPage = await browser.newPage({
  viewport: {width: 390, height: 844},
  reducedMotion: 'reduce',
});
await reducedPage.goto(baseURL, {waitUntil: 'networkidle'});
await reducedPage.waitForSelector('.outcome-volume-stage');
await reducedPage.waitForTimeout(300);
const reduced = await reducedPage.evaluate(() => ({
  diagnostics: window.__outcomeVolumeDiagnostics,
  stageFallback: document.querySelector('.outcome-volume-stage')?.dataset.fallback || 'false',
}));
assert(reduced.diagnostics, 'reduced motion diagnostics unavailable');
assert(reduced.diagnostics.reducedMotion === true, 'reduced motion not detected');
assert(reduced.diagnostics.labelCount === 5, 'reduced motion is missing field labels');
assert(reduced.diagnostics.settled === true, 'reduced motion did not show final state immediately');
assert(reduced.diagnostics.continuousAnimation === false, 'reduced motion started continuous animation');
assert(reduced.diagnostics.frameCount <= 2, `reduced motion rendered too many frames: ${reduced.diagnostics.frameCount}`);
await reducedPage.close();

const fallbackPage = await browser.newPage({viewport: {width: 1280, height: 800}});
await fallbackPage.addInitScript(() => {
  window.__forceOutcomeVolumeFallback = true;
});
await fallbackPage.goto(baseURL, {waitUntil: 'networkidle'});
await fallbackPage.waitForSelector('.outcome-volume-stage[data-fallback="true"]');
const fallback = await fallbackPage.evaluate(() => {
  const nodes = [...document.querySelectorAll('.outcome-volume__fallback-label > span')];
  return {
    diagnostics: window.__outcomeVolumeDiagnostics,
    fallbackDisplay: getComputedStyle(document.querySelector('.outcome-volume__fallback')).display,
    labels: nodes.map(node => ({
      text: node.textContent.trim(),
      display: getComputedStyle(node).display,
      rect: node.getBoundingClientRect().toJSON(),
    })),
    scenarioPresent: Boolean(document.querySelector('.outcome-strip--scenario')),
  };
});
assert(fallback.diagnostics?.fallbackActive === true, 'forced fallback did not activate');
assert(fallback.diagnostics?.settled === true, 'fallback did not resolve to final state');
assert(fallback.fallbackDisplay !== 'none', 'fallback visual is hidden');
assert(fallback.labels.length === 5, `fallback has ${fallback.labels.length} labels`);
assert(
  JSON.stringify(fallback.labels.map(label => label.text)) === JSON.stringify(expectedLabels),
  `fallback labels are ${JSON.stringify(fallback.labels.map(label => label.text))}`,
);
fallback.labels.forEach(label => {
  assert(label.display !== 'none', `${label.text}: fallback label is hidden`);
  assert(label.rect.width > 0 && label.rect.height > 0, `${label.text}: fallback label has no geometry`);
});
assert(fallback.scenarioPresent, 'fallback removed interactive Outcome Span');
await fallbackPage.locator('.outcome-volume-stage').screenshot({
  path: 'qa/renders/three-outcome-volume/fallback-component.png',
});
await fallbackPage.close();

const documentPage = await browser.newPage({viewport: {width: 1280, height: 900}});
await documentPage.goto(new URL('resume.html', baseURL).href, {waitUntil: 'networkidle'});
await documentPage.waitForSelector('.doc-logo');
const docLogo = await documentPage.evaluate(() => {
  const logo = document.querySelector('.doc-logo');
  const rect = logo.getBoundingClientRect();
  return {
    background: getComputedStyle(logo).backgroundColor,
    width: rect.width,
    height: rect.height,
  };
});
assert(isWhite(docLogo.background), `document logo field is ${docLogo.background}`);
assert(docLogo.width > 100 && docLogo.height > 40, 'document logo field is undersized');
await documentPage.locator('.doc-header').screenshot({
  path: 'qa/renders/three-outcome-volume/document-logo-header.png',
});
await documentPage.close();

await browser.close();
console.log('Three.js Outcome Volume rendered regression: PASS');
