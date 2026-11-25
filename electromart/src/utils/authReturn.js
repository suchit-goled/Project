// Route guards store a React Router location when an action needs sign-in.
export function authReturn(location, fallback) {
  const from = location.state?.from;
  if (from && /^\/(?!\/)[^\\]*$/.test(from.pathname)) {
    return { pathname: from.pathname, search: from.search, hash: from.hash };
  }
  return new URLSearchParams(location.search).get("redirect") === "/checkout" ? "/checkout" : fallback;
}
