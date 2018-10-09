declare var global: NodeJS.Global;
declare namespace NodeJS {
  export interface Global {
    fetch: typeof fetch;
    Headers: typeof Headers;
    Request: typeof Request;
    Response: typeof Response;
  }
}
import realFetch from "node-fetch";

const f = function(input: string, init: RequestInit = {}): Promise<Response> {
  if (/^\/\//.test(input)) {
    input = "https:" + input;
  }
  init.headers = {
    "user-agent":
      "fetch-register/1.0 (+https://github.com/codler/fetch-register)",
    ...init.headers
  };
  return realFetch.call(this, input, init);
};

if (!global.fetch) {
  global.fetch = f;
  global.Headers = realFetch.Headers;
  global.Request = realFetch.Request;
  global.Response = realFetch.Response;
}

export default f;
