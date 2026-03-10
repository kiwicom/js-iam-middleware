import test from "ava";
import { isOAuthCallbackUrl } from "./oauthCallback";

test("recognizes OAuth callback when code is first query param", (t) => {
  t.true(isOAuthCallbackUrl("/?code=4%2F0Afge..."));
});

test("recognizes OAuth callback when code is not first (e.g. Google order)", (t) => {
  const url =
    "/?iss=https%3A%2F%2Faccounts.google.com&code=4%2F0Afge...&scope=openid+email";
  t.true(isOAuthCallbackUrl(url));
});

test("recognizes OAuth callback with code in the middle of many params", (t) => {
  t.true(
    isOAuthCallbackUrl(
      "/?state=xyz&iss=foo&code=abc123&scope=openid&authuser=0",
    ),
  );
});

test("rejects URL without code param", (t) => {
  t.false(isOAuthCallbackUrl("/?iss=foo&scope=openid"));
});

test("rejects URL with path other than root", (t) => {
  t.false(isOAuthCallbackUrl("/callback?code=abc"));
});

test("rejects empty code", (t) => {
  t.false(isOAuthCallbackUrl("/?code=&scope=openid"));
});
