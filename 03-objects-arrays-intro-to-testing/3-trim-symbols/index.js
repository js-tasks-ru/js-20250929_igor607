/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {
    return string;
  }
  if (size < 1 || !string) {
    return "";
  }
  let result = "";
  let lastChar = "";
  let count = 0;
  for (const char of string) {
    if (char === lastChar) {
      count++;
    } else {
      lastChar = char;
      count = 1;
    }
    if (count <= size) {
      result += char;
    }
  }
  return result;
}
