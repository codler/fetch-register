declare var global: NodeJS.Global;
declare namespace NodeJS {
  export interface Global {
    fetch: typeof fetch;
    Headers: typeof Headers;
    Request: typeof Request;
    Response: typeof Response;
  }
}
import fetchImpl from "node-fetch";
import fetchWrapper from "./fetchWrapper";

// default https protocol
fetchWrapper.registerDecorator(
  (impl: Function, input: string, init: RequestInit) => {
    if (/^\/\//.test(input)) {
      input = "https:" + input;
    }
    return [impl, input, init];
  }
);

// Set user agent
fetchWrapper.registerDecorator(
  (impl: Function, input: string, init: RequestInit) => {
    init.headers = {
      "user-agent":
        "fetch-register/1.3.2 (+https://github.com/codler/fetch-register)",
      ...init.headers
    };
    return [impl, input, init];
  }
);

// set-cookie header implementation
const cookies = {};
fetchWrapper.registerDecorator(
  (impl: Function, input: string, init: RequestInit) => {
    const cookie = Object.keys(cookies)
      .map(key => {
        return key + "=" + cookies[key];
      })
      .join("; ");
    init.headers = {
      ...init.headers,
      cookie: cookie
    };

    const hook = (input, init) => {
      return impl(input, init).then(response => {
        const setCookie: string[] = (response.headers as any).raw()[
          "set-cookie"
        ];
        if (setCookie) {
          setCookie.forEach((cookie: string) => {
            const key = cookie.split("=")[0];
            const value = cookie.split("=")[1].split(";")[0];
            if (cookie.indexOf("expires") !== -1 || value === "") {
              delete cookies[key];
            } else {
              cookies[key] = value;
            }
          });
        }
        return response;
      });
    };
    return [hook, input, init];
  }
);

// location header implementation
fetchWrapper.registerDecorator(
  (impl: Function, input: string, init: RequestInit) => {
    init.redirect = "manual";

    const hook = (input, init) => {
      return impl(input, init).then(response => {
        const isRedirect =
          response.status === 301 ||
          response.status === 302 ||
          response.status === 303;

        if (isRedirect) {
          return impl(response.headers.get("location"), init);
        }
        return response;
      });
    };
    return [hook, input, init];
  }
);

if (!global.fetch) {
  global.fetch = fetchWrapper as any;
  global.Headers = fetchImpl.Headers;
  global.Request = fetchImpl.Request;
  global.Response = fetchImpl.Response;
}

export default global.fetch;
