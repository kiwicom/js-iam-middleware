import test from "ava";
import { cachedKeys, getPubKey, validateIAPToken } from "./validateIAPToken";
import { mockFetch, mockToken, keyPair } from "./testUtils";

const mockPubKeys = {
  test: keyPair.public,
  test1: "test1 pubkey",
  test2: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEfHEdeT3a6KaC1kbwov73ZwB/SiUH
EyKQwUUtMCEn0aJBY6PA+Eic24+WqPEtDKG95elao4VxA+Fne36Sgw1tkg==
-----END PUBLIC KEY-----
`,
};

test("getPubKey fetches key correctly", async (t) => {
  t.deepEqual(cachedKeys, {}, "No keys are cached");

  const pubKey = await getPubKey("test1", mockFetch(mockPubKeys));

  t.deepEqual(cachedKeys, mockPubKeys);
  t.is(pubKey, "test1 pubkey");

  const pubKey2 = await getPubKey("test1", mockFetch(null));
  t.is(pubKey2, "test1 pubkey");
});

test("getPubKey fails on missing key", async (t) => {
  t.deepEqual(cachedKeys, {}, "No keys are cached");

  await t.throwsAsync(() =>
    getPubKey("notExistingPubKey", mockFetch(mockPubKeys)),
  );
});

test("validate ", async (t) => {
  const testJWT = mockToken({
    iss: "https://cloud.google.com/iap",
    aud: "expected_audience",
    email: "test@test.com",
  });

  const payload = await validateIAPToken(
    testJWT,
    "expected_audience",
    mockFetch(mockPubKeys),
  );
  t.deepEqual(payload, {
    iat: new Date("10 Oct 2019").getTime(),
    iss: "https://cloud.google.com/iap",
    aud: "expected_audience",
    email: "test@test.com",
  });
});

test("validate multiple audiences ", async (t) => {
  const tokens = [
    {
      iss: "https://cloud.google.com/iap",
      aud: "expected_audience",
      email: "test@test.com",
    },
    {
      iss: "https://cloud.google.com/iap",
      aud: "expected_audience2",
      email: "test@test.com",
    },
  ];
  for (const token of tokens) {
    const testJWT = mockToken(token);
    const payload = await validateIAPToken(
      testJWT,
      ["expected_audience", "expected_audience2"],
      mockFetch(mockPubKeys),
    );
    t.deepEqual(payload, {
      iat: new Date("10 Oct 2019").getTime(),
      iss: token.iss,
      aud: token.aud,
      email: token.email,
    });
  }
});

[
  ["invalid JWT", "invalid JWT"],
  [
    mockToken({
      iss: "unexpected_issuer",
      aud: "expected_audience",
      email: "test@test.com",
    }),
    "Invalid IAP issuer",
  ],
  [
    mockToken({
      iss: "https://cloud.google.com/iap",
      aud: "unexpected_audience",
      email: "test@test.com",
    }),
    "Invalid audience",
  ],
  [
    mockToken(
      {
        iss: "https://cloud.google.com/iap",
        aud: "expected_audience",
        email: "test@test.com",
      },
      null,
    ),
    'Missing "kid" attribute',
  ],
  [
    mockToken(
      {
        iss: "https://cloud.google.com/iap",
        aud: "expected_audience",
        email: "test@test.com",
      },
      "test2",
    ),
    "invalid signature",
  ],
].forEach(([testJWT, message]) => {
  test(`Fails with: ${message}`, async (t) => {
    const err = await t.throwsAsync(() =>
      validateIAPToken(testJWT, "expected_audience", mockFetch(mockPubKeys)),
    );
    t.assert(err?.message.includes(message), `[${err}] contains [${message}]`);
  });
});
