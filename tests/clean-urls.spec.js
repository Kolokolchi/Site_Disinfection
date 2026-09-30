const { test, expect } = require('@playwright/test');
const routes = require('../content/routes.json');

// Expected addresses are defined independently of the runtime route helper.
const cleanPath = route => route === 'index.html' ? '/' : '/' + route.slice(0, -5);

test('All clean URLs serve content directly and old URLs permanently redirect once', async ({ request, page }) => {
  for (const route of [...routes, 'admin.html']) {
    const destination = cleanPath(route);
    const old = await request.get('/' + route + '?utm_source=legacy&value=a%26b', { maxRedirects: 0 });
    expect(old.status(), route).toBe(308);
    const location = new URL(old.headers().location, old.url());
    expect(location.pathname, route).toBe(destination);
    expect(location.searchParams.get('utm_source'), route).toBe('legacy');
    expect(location.searchParams.get('value'), route).toBe('a&b');
    const response = await request.get(location.href, { maxRedirects: 0 });
    expect(response.status(), destination).toBe(200);
    if (route === 'admin.html') {
      expect(await response.text()).toContain('noindex');
    } else {
      const html = await response.text();
      const links = await page.evaluate(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return {
          canonical: doc.querySelector('link[rel="canonical"]').getAttribute('href'),
          internal: [...doc.querySelectorAll('a[href]')].map(el => el.getAttribute('href')).filter(href => !/^(https?:|tel:|mailto:)/.test(href)),
        };
      }, html);
      expect(links.canonical, route).toBe('https://discleaning.kz' + destination);
      expect(links.internal.some(href => /\.html(?:#|\?|$)/.test(href)), route).toBe(false);
    }
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  expect(urls.sort()).toEqual(routes.map(route => 'https://discleaning.kz' + cleanPath(route)).sort());
  for (const route of ['/missing', '/missing.html', '/services/cleaning', '/services/cleaning.html', '/services/zapakh', '/services/kroty', '/services/zmei']) {
    expect((await request.get(route, { maxRedirects: 0 })).status(), route).toBe(404);
  }
});

test('Clean navigation, legacy bookmarks and homepage anchors preserve the chosen language', async ({ page }) => {
  await page.route('https://**/*', route => route.abort());
  await page.goto('/index.html?utm_source=bookmark#contacts');
  await expect(page).toHaveURL(/\/\?utm_source=bookmark#contacts$/);
  await expect(page.locator('#contacts')).toBeInViewport();
  await page.locator('header [data-lang="kz"]').click();
  await page.goto('/objects/dentistry.html');
  await expect(page).toHaveURL(/\/objects\/dentistry$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'kk');
  await page.locator('header a[href="/#services"]').click();
  await expect(page).toHaveURL(/\/#services$/);
  await expect(page.locator('#services')).toBeInViewport();
  await expect(page.locator('html')).toHaveAttribute('lang', 'kk');
  await page.goto('/objects');
  await page.locator('.object-card[href="/objects/medicine"]').click();
  await expect(page).toHaveURL(/\/objects\/medicine$/);
  await page.locator('.facility-row[href="/objects/dentistry"]').click();
  await expect(page).toHaveURL(/\/objects\/dentistry$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/objects\/medicine$/);
});
