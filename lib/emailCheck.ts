// Email format check that's safe to use in the browser.
export const isEmail = (s: unknown): s is string => typeof s === "string" && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
