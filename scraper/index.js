const axios = require('axios');
const axiosCookieJarSupport = require('node-axios-cookiejar');
const { isProtectedByStormwall, getStormwallCookie } = require('stormwall-bypass');
const { getUserAgent } = require('./src/utils');
const fillCookiesJar = require('./src/fillCookiesJar');
const tough = require('tough-cookie');
const { isCloudflareJSChallenge, isCloudflareCaptchaChallenge } = require('./src/utils');

const isCloudflareIUAMError = (error) => {
  if (error.response) {
    const { data } = error.response;
    return isCloudflareJSChallenge(data) || isCloudflareCaptchaChallenge(data);
  }
  return false;
}

const handleError = async (error) => {
  if (isCloudflareIUAMError(error)) {
    const config = error.request;
    await fillCookiesJar(myAxios, config);
    return await myAxios(options);
  }
  throw error;
}

const handleResponse = async (response, options) => {
  const { url } = response;
  const body = response.data;
  if (isProtectedByStormwall(body)) {
    const cookie = getStormwallCookie(body);
    cookieJar.setCookie(cookie, url);
    return await myAxios(options);
  }
  return response;
}

const cookieJar = new tough.CookieJar()
const defaultParams = {
  jar: cookieJar,
  headers: { 'User-Agent': getUserAgent() },
  withCredentials: true
};

const myAxios = axiosCookieJarSupport(axios.create(defaultParams))
myAxios.interceptors.request.use(handleResponse, handleError)
module.exports = myAxios;
