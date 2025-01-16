export const forEachValue = (obj, fn) => {
  Object.keys(obj).forEach((key) => fn(obj[key], key));
};

export const isPromise = (val) => {
  return val && typeof val.then === "function";
};
