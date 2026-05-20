export const parseLinks = (value: string) => value
  .split(/\r?\n|,/)
  .map((item) => item.trim())
  .filter(Boolean);