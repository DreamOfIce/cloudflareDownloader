const createBrowser = require('./createBrowser');
const { Cookie } = require('tough-cookie');
const handleCaptcha = require('./handleCaptcha');
const { isCloudflareJSChallenge, isCloudflareCaptchaChallenge } = require('./utils');
const DEFAULT_EXPIRATION_TIME_IN_SECONDS = 3000;

function convertCookieToTough(cookie) {
  const { name, value, expires, domain, path } = cookie;
  const isExpiresValid = expires && typeof expires === 'number';

  const expiresDate = isExpiresValid
    ? new Date(expires * 1000)
    : new Date(Date.now() + DEFAULT_EXPIRATION_TIME_IN_SECONDS * 1000);

  return new Cookie({
    key: name,
    value,
    expires: expiresDate,
    domain: domain.startsWith('.') ? domain.substring(1) : domain,
    path
  });
}

async function fillCookiesJar(axiosInstance, options) {
  let { url } = options;
  const browser = await createBrowser(options);
  try {
    const page = await browser.newPage();
    let response = await page.goto(url, {
      timeout: 45000,
      waitUntil: 'domcontentloaded'
    });

    let count = 1;
    let content = await page.content();

    while (isCloudflareJSChallenge(content)) {
      response = await page.waitForNavigation({
        timeout: 45000,
        waitUntil: 'domcontentloaded'
      });
      content = await page.content();
      if (count++ === 100) {
        throw new Error('timeout on just a moment');
      }
    }
    if (isCloudflareCaptchaChallenge(content)) {
      await handleCaptcha(content, axiosInstance, options);
    }

    const cookies = await page.cookies();
    for (let cookie of cookies) {
      cookieJar.setCookie(convertCookieToTough(cookie), url);
    }
  } finally {
    await browser.close();
  }
}

module.exports = fillCookiesJar;
