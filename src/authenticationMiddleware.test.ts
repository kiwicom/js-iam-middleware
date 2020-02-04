import test from "ava";
import { audienceRegex, authenticationMiddleware, required } from "./authenticationMiddleware";

test("required returns correct values", (t) => {
  const tests: Array<[any, string]> = [
    [{ i: "exist" }, "object"],
    [42, "number"],
    [0, "falsy number"],
    ["I exist", "string"],
    ["", "falsy string"],
    [false, "boolean"],
    [true, "boolean"],
  ];
  tests.forEach(([expected, name]) => {
    const actual = required(expected, name);
    t.deepEqual(actual, expected);
  });
});

test("required throws on null or undefined", (t) => {
  const err = t.throws(() => required(undefined, "notExisting"));
  t.is(err.message, "Missing 'notExisting', option must be specified.");

  const err2 = t.throws(() => required(null, "notExisting"));
  t.is(err2.message, "Missing 'notExisting', option must be specified.");
});

test("authenticationMiddleware throws on missing IAP token if initialised with audience", (t) => {
  const tests: Array<string> = [
    "/projects/000000000000/global/backendServices/0000000000000000000",
    "/projects/000000000000/apps/my-sample-project-191923",
  ];

  tests.forEach((audience) => {
    const opts = {
      audience: audience
    };

    const err = t.throws(() => authenticationMiddleware(opts));
    t.is(err.message, "IAP token not present");
  });
});

test("authenticationMiddleware throws on malformed audience", (t) => {
  const opts = {
    audience: "this is not valid"
  };

  const err = t.throws(() => authenticationMiddleware(opts));
  t.is(err.message, `'audience' needs to be a string matching ${audienceRegex}`);
});

test("authenticationMiddleware throws on missing IAP token if initialised deprecated options", (t) => {
  const opts = {
    iapProjectNumber: "test",
    iapServiceID: "test",
  };

  const err = t.throws(() => authenticationMiddleware(opts));
  t.is(err.message, "IAP token not present");
});
