const axios = require('axios');
const axiosCookieJarSupport = require('node-axios-cookiejar');
const { isProtectedByStormwall, getStormwallCookie } = require('stormwall-bypass');
const { getUserAgent } = require('./src/utils');
const fillCookiesJar = require('./src/fillCookiesJar');
const tough = require('tough-cookie');
const { isCloudflareJSChallenge, isCloudflareCaptchaChallenge } = require('./src/utils');

const isCloudflareIUAMError = (data) => {
  console.log('IUAM Error')
  if (!!data) {
    return isCloudflareJSChallenge(data) || isCloudflareCaptchaChallenge(data);
  }
  return false;
}

const handleError = async (response) => {
  if (isCloudflareIUAMError(response.data)) {
    const { config } = response;
    await fillCookiesJar(myAxios, config);
    return await myAxios(config);
  }
  throw new Error('Origin esponse with status code 503');
}

const handleResponse = async (response) => {
  if (response.status === 503) return handleError(response);
  const { url } = response.config;
  const body = response.data;
  if (isProtectedByStormwall(body)) {
    console.log('Protected by stormwall')
    const cookie = getStormwallCookie(body);
    cookieJar.setCookie(cookie, url);
    return await myAxios(response.config);
  }
  return response;
}

const cookieJar = new tough.CookieJar()
const defaultParams = {
  jar: cookieJar,
  headers: { 'User-Agent': getUserAgent() },
  withCredentials: true,
  validateStatus: code => code >= 200 && code < 300 || code === 503
};

const myAxios = axiosCookieJarSupport(axios.create(defaultParams))
myAxios.interceptors.response.use(handleResponse)
module.exports = myAxios;
