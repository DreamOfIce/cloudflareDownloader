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
  if (response.config.responseType !== 'stream') {
    if (isCloudflareIUAMError(response.data)) {
      const { config } = response;
      await fillCookiesJar(myAxios, config);
      return await myAxios(config);
    }
  } else if (response.headers['server'] === 'cloudflare' &&
    response.headers['content-type'] === 'text/html' &&
    response.headers['content-length'] < 5120) {//为尽可能避免对流的阻塞,对流进行过滤
    let receivePromise = new Promise((reslove, reject) => {
      let resData;
      response.data.on('data', (data) => resData += data)
        .on('end', reslove(resData)).on('error', reject);
    });
    await receivePromise;
  } else {
    throw new Error('Origin responses with status code 503');
  }
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
  //validateStatus: code => code >= 200 && code < 300 || code === 503
};

const myAxios = axiosCookieJarSupport(axios.create(defaultParams))
myAxios.interceptors.response.use(handleResponse, (err, response) => { console.log(err) })
module.exports = myAxios;
