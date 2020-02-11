import test from "ava";
import { audienceRegex, authenticationMiddleware, required, validateAudience } from "./authenticationMiddleware";

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

test("validateAudience passes on valid values", (t) => {
  const tests: string[] = [
    "/projects/000000000000/global/backendServices/0000000000000000000",
    "/projects/000000000000/apps/my-sample-project-191923",
  ];
  tests.forEach(audience => {
    t.notThrows(() => validateAudience(audience));
  });
});

test("validateAudience throws on invalid values", (t) => {
  const tests: any[] = [
    "not a valid audience",
    "",
    undefined,
    {},
  ];
  tests.forEach(audience => {
    const err = t.throws(() => validateAudience(audience));
    t.is(err.message, `'audience' needs to be a string matching ${audienceRegex}`);
  });
});

test("required throws on null or undefined", (t) => {
  const err = t.throws(() => required(undefined, "notExisting"));
  t.is(err.message, "Missing 'notExisting', option must be specified.");

  const err2 = t.throws(() => required(null, "notExisting"));
  t.is(err2.message, "Missing 'notExisting', option must be specified.");
});

test("authenticationMiddleware throws on getting IAP token if initialised with audience", async t => {
  const tests: string[] = [
    "/projects/000000000000/global/backendServices/0000000000000000000",
    "/projects/000000000000/apps/my-sample-project-191923",
  ];

  for (let audience of tests) {
    const opts = {
      audience: audience
    };

    await t.throwsAsync(
      () => authenticationMiddleware(opts)({} as any, {} as any, {} as any),
      {instanceOf: TypeError, message: "req.get is not a function"}
    );
  }
});

test("authenticationMiddleware throws on malformed audience", async t => {
  const opts = {
    audience: "not a valid audience"
  };

  await t.throwsAsync(
    () => authenticationMiddleware(opts)({} as any, {} as any, {} as any),
    {instanceOf: TypeError, message: `'audience' needs to be a string matching ${audienceRegex}`}
  );
});

test("authenticationMiddleware throws on getting IAP token if initialised with deprecated options", async t => {
  const opts = {
    iapProjectNumber: "test",
    iapServiceID: "test",
  };

  await t.throwsAsync(
    () => authenticationMiddleware(opts)({} as any, {} as any, {} as any),
    {instanceOf: TypeError, message: "req.get is not a function"}
  );
});
