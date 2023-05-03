export const getValueByKey = (
  pathArray: string[],
  obj: { [k: string]: any }
) => {
  if (!Array.isArray(pathArray) || pathArray.length === 0) {
    throw new Error("Invalid path argument");
  }
  return pathArray.reduce((acc, key) => {
    if (!acc || typeof acc !== "object" || !(key in acc)) {
      return undefined;
    }

    return acc[key];
  }, obj);
};
