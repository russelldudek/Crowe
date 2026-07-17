import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = process.env.CAMPAIGN_URL || 'http://127.0.0.1:4173/';
const routes = [
  {name: 'home', path: ''},
  {name: 'resume', path: 'resume.html'},
  {name: 'cover-letter', path: 'cover-letter.html'},
  {name: 'interview-brief', path: 'interview-brief.html'},
  {name: '90-day-plan', path: '90-day-plan.html'},
  {name: 'fde-workstream-review', path: 'fde-workstream-review.html'},
];
const viewports = [
  {name: 'desktop', width: 1280, height: 900},
  {name: 'mobile', width: 390, height: 844},
];
const surfaceSelectors = [
  '.site-header',
  '.hero',
  '.lab-stage',
  '.section.dark',
  '.site-footer',
  '.doc-actions',
  '.decision-box',
  '.doc-diagram',
  '.doc-table th',
];

await fs.mkdir('qa/renders/visual-contrast', {recursive: true});
const browser = await chromium.launch({headless: true});
const results = [];

for (const viewport of viewports) {
  for (const route of routes) {
    const page = await browser.newPage({viewport});
    const errors = [];
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', error => errors.push(error.message));

    await page.goto(new URL(route.path, baseURL).href, {waitUntil: 'networkidle'});
    await page.waitForTimeout(400);

    const report = await page.evaluate(selectors => {
      const parseColor = value => {
        const match = value?.match(/rgba?\(([^)]+)\)/i);
        if (!match) return null;
        const parts = match[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
        return {
          r: parts[0],
          g: parts[1],
          b: parts[2],
          a: parts.length > 3 ? parts[3] : 1,
        };
      };

      const composite = (front, back) => {
        const alpha = front.a + back.a * (1 - front.a);
        if (alpha === 0) return {r: 0, g: 0, b: 0, a: 0};
        return {
          r: (front.r * front.a + back.r * back.a * (1 - front.a)) / alpha,
          g: (front.g * front.a + back.g * back.a * (1 - front.a)) / alpha,
          b: (front.b * front.a + back.b * back.a * (1 - front.a)) / alpha,
          a: alpha,
        };
      };

      const channel = value => {
        const normalized = value / 255;
        return normalized <= 0.03928
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      };

      const luminance = color => (
        0.2126 * channel(color.r)
        + 0.7152 * channel(color.g)
        + 0.0722 * channel(color.b)
      );

      const contrast = (a, b) => {
        const lighter = Math.max(luminance(a), luminance(b));
        const darker = Math.min(luminance(a), luminance(b));
        return (lighter + 0.05) / (darker + 0.05);
      };

      const effectiveBackground = element => {
        const chain = [];
        for (let node = element; node instanceof Element; node = node.parentElement) chain.push(node);
        chain.reverse();
        let result = {r: 255, g: 255, b: 255, a: 1};
        for (const node of chain) {
          const color = parseColor(getComputedStyle(node).backgroundColor);
          if (color && color.a > 0) result = composite(color, result);
        }
        return result;
      };

      const directText = element => [...element.childNodes]
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent || '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      const failures = [];
      const audited = [];
      const surfaces = [...document.querySelectorAll(selectors.join(','))];

      for (const surface of surfaces) {
        const candidates = [surface, ...surface.querySelectorAll('*')];
        for (const element of candidates) {
          const text = directText(element);
          if (!text) continue;
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          if (
            style.display === 'none'
            || style.visibility === 'hidden'
            || Number(style.opacity) === 0
            || rect.width <= 0
            || rect.height <= 0
          ) continue;

          const foreground = parseColor(style.color);
          if (!foreground) continue;
          const background = effectiveBackground(element);
          const compositedForeground = composite(foreground, background);
          const ratio = contrast(compositedForeground, background);
          const fontSize = Number.parseFloat(style.fontSize) || 0;
          const fontWeight = Number.parseInt(style.fontWeight, 10) || 400;
          const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
          const minimum = isLarge ? 3 : 4.5;
          const record = {
            text: text.slice(0, 200),
            selector: element.tagName.toLowerCase() + (element.className ? `.${String(element.className).trim().replace(/\s+/g, '.')}` : ''),
            foreground: style.color,
            background: `rgb(${Math.round(background.r)}, ${Math.round(background.g)}, ${Math.round(background.b)})`,
            ratio: Number(ratio.toFixed(2)),
            minimum,
          };
          audited.push(record);
          if (ratio + 0.01 < minimum) failures.push(record);
        }
      }

      const brokenImages = [...document.images]
        .filter(image => image.complete && image.naturalWidth === 0)
        .map(image => image.getAttribute('src'));

      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        auditedCount: audited.length,
        failures,
        brokenImages,
      };
    }, surfaceSelectors);

    await page.screenshot({
      path: `qa/renders/visual-contrast/${viewport.name}-${route.name}.png`,
      fullPage: true,
    });

    results.push({
      viewport: viewport.name,
      route: route.name,
      ...report,
      browserErrors: errors,
    });
    await page.close();
  }
}

await browser.close();
await fs.writeFile(
  'qa/renders/visual-contrast/report.json',
  JSON.stringify(results, null, 2),
  'utf8',
);

const problems = [];
for (const result of results) {
  const key = `${result.viewport}/${result.route}`;
  if (result.overflow > 1) problems.push(`${key}: horizontal overflow ${result.overflow}px`);
  if (result.auditedCount === 0) problems.push(`${key}: no dark-surface text audited`);
  if (result.brokenImages.length) problems.push(`${key}: broken images ${result.brokenImages.join(', ')}`);
  if (result.browserErrors.length) problems.push(`${key}: browser errors ${result.browserErrors.join(' | ')}`);
  for (const failure of result.failures) {
    problems.push(
      `${key}: ${failure.ratio}:1 < ${failure.minimum}:1 | ${failure.foreground} on ${failure.background} | ${failure.text}`,
    );
  }
}

if (problems.length) {
  throw new Error(`Cross-route visual QA failed:\n${problems.join('\n')}`);
}

console.log('Cross-route visual contrast audit: PASS');
