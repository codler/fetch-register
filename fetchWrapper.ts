import fetchImpl from "node-fetch";

type decoratorCallbackReturn = any[];
type decoratorCallback = (
  impl: Function,
  input: string,
  init: RequestInit
) => decoratorCallbackReturn;

const decorators = [];

const fetchWrapper: any = function(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const appliedDecorator = decorators.reduce(
    (prev: decoratorCallbackReturn, curr: decoratorCallback) => {
      return curr.call(this, prev[0], prev[1], prev[2]);
    },
    [fetchImpl, input, init]
  );

  return appliedDecorator[0].call(...appliedDecorator);
};

fetchWrapper.registerDecorator = (decorator: decoratorCallback) => {
  decorators.push(decorator);
};

export default fetchWrapper;
