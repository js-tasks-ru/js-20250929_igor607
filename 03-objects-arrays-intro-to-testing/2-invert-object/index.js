/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  const result = {};

  if (obj === undefined) {
    return undefined;
  }
  if (obj === null || typeof obj !== "object") {
    return {};
  }
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      result[obj[key]] = key;
    }
  }
  return result;
}
