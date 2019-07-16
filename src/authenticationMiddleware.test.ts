import test from "ava";
import { required } from "./authenticationMiddleware";

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
