const realFetch = require("node-fetch");
module.exports = function(url, options = {}) {
  if (/^\/\//.test(url)) {
    url = "https:" + url;
  }
  options.headers = {
    "user-agent":
      "fetch-register/1.0 (+https://github.com/codler/fetch-register)",
    ...options.headers
  };
  return realFetch.call(this, url, options);
};

if (!global.fetch) {
  global.fetch = module.exports;
  global.Response = realFetch.Response;
  global.Headers = realFetch.Headers;
  global.Request = realFetch.Request;
}
