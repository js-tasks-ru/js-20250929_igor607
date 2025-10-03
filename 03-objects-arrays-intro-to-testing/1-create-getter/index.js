/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const parts = path.split(".");

  return function (obj) {
    let current = obj;

    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      if (!Object.hasOwn(current, part)) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  };
}
