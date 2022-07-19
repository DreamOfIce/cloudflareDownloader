const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36';

function getUserAgent() {
  return USER_AGENT;
}

function extract(string, regexp, errorMessage) {
  const match = string.match(regexp);
  if (match) {
    return match[1];
  }
  if (errorMessage) {
    throw new Error(errorMessage);
  }
}

function isCloudflareJSChallenge(body) {
  return body.includes('managed_checking_msg');
}

function isCloudflareCaptchaChallenge(body) {
  return body.includes('cf_captcha_kind');
}

module.exports = { extract, isCloudflareJSChallenge, isCloudflareCaptchaChallenge, getUserAgent };
