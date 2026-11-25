import { authReturn } from "./authReturn";

test("preserves checkout and the full route requested by the shopper", () => {
  expect(authReturn({ search:"?redirect=/checkout" }, "/")).toBe("/checkout");
  const from = { pathname:"/orders/42", search:"?package=2", hash:"#progress" };
  expect(authReturn({ state:{ from } }, "/")).toEqual(from);
});

test("uses the fallback for unrelated and external targets", () => {
  expect(authReturn({ search:"?redirect=https://example.com" }, "/")).toBe("/");
  expect(authReturn({ state:{ from:{ pathname:"//example.com" } } }, "/profile")).toBe("/profile");
});
