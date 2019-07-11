import test from "ava";
import { cachedKeys, getPubKey, validate } from "./validateIAPToken";
import { Response } from "node-fetch";

const mockFetch = (response: any) => async () =>
  new Response(JSON.stringify(response));

const mockPubKeys = {
  test1: "test1 pubkey",
  test2: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEVs/o5+uQbTjL3chynL4wXgUg2R9
q9UU8I5mEovUf86QZ7kOBIjJwqnzD1omageEHWwHdBO6B+dFabmdT9POxg==
-----END PUBLIC KEY-----`,
  test3: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEfHEdeT3a6KaC1kbwov73ZwB/SiUH
EyKQwUUtMCEn0aJBY6PA+Eic24+WqPEtDKG95elao4VxA+Fne36Sgw1tkg==
-----END PUBLIC KEY-----
`,
};

test("getPubKey fetches key correctly", async t => {
  t.deepEqual(cachedKeys, {}, "No keys are cached");

  const pubKey = await getPubKey("test1", mockFetch(mockPubKeys));

  t.deepEqual(cachedKeys, mockPubKeys);
  t.is(pubKey, "test1 pubkey");

  const pubKey2 = await getPubKey("test1", mockFetch(null));
  t.is(pubKey2, "test1 pubkey");
});

test("getPubKey fails on missing key", async t => {
  t.deepEqual(cachedKeys, {}, "No keys are cached");

  await t.throwsAsync(() =>
    getPubKey("notExistingPubKey", mockFetch(mockPubKeys)),
  );
});

test("validate ", async t => {
  const testJWT =
    "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3QyIn0.eyJpc3MiOiJodHRwczovL2Nsb3VkLmdvb2dsZS5jb20vaWFwIiwiYXVkIjoiZXhwZWN0ZWRfYXVkaWVuY2UiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20ifQ.PamTikS5PMwwjhy5WXcSsO0xq4XHuAfoPWE7UR6auJko9nNPzS7KTo3jQGE1GeWjKRt1vL_O3MxTk-G7cEBrQA";

  const payload = await validate(
    testJWT,
    "expected_audience",
    mockFetch(mockPubKeys),
  );
  t.deepEqual(payload, {
    iss: "https://cloud.google.com/iap",
    aud: "expected_audience",
    email: "test@test.com",
  });
});

[
  ["invalid JWT", "invalid JWT"],
  [
    // iss: unexpected_issuer
    "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3QyIn0.eyJpc3MiOiJ1bmV4cGVjdGVkX2lzc3VlciIsImF1ZCI6ImV4cGVjdGVkX2F1ZGllbmNlIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIn0.2PX3VRPgNRzAY847TXj8KlvoZUXZgpHeApfAqsfkladhu-9xV0XnwSmEGfr_f0Pi4gt74W6J4Ros6jY6l-wE8g",
    "Invalid IAP issuer",
  ],
  [
    // aud: unexpected_audience
    "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3QyIn0.eyJpc3MiOiJodHRwczovL2Nsb3VkLmdvb2dsZS5jb20vaWFwIiwiYXVkIjoidW5leHBlY3RlZF9hdWRpZW5jZSIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSJ9.4_P8W7zHu0Z_YNq-stJw6EQRHXmi8wlmbJ41F4whLOh3YkC4Jg9us4gNLAJzKg-lBojU4nKzTmZ-DwHg202hgw",
    "Invalid audience",
  ],
  [
    // kid: undefined
    "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2Nsb3VkLmdvb2dsZS5jb20vaWFwIiwiYXVkIjoiZXhwZWN0ZWRfYXVkaWVuY2UiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20ifQ.9AsGe6tvRbobSFtoUfI-RcX-_yHDbdTFkI9cCJVkI2IUfzQW6SGe7WKsU9CSSPFnxfFB9w2grEruMhIv540Wyw",
    'Missing "kid" attribute',
  ],
  [
    // kid: test3
    "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3QzIn0.eyJpc3MiOiJodHRwczovL2Nsb3VkLmdvb2dsZS5jb20vaWFwIiwiYXVkIjoiZXhwZWN0ZWRfYXVkaWVuY2UiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20ifQ.irnwflvbwvZ8rCaoByFOrnr9QDsHY-EkijYc9er82gOWmPN5t-tsNzxW9IaQ6JZyPAUIIHC7C-qC2zEhTG_y_A",
    "invalid signature",
  ],
].forEach(([testJWT, message]) => {
  test(`Fails with: ${message}`, async t => {
    const err = await t.throwsAsync(() =>
      validate(testJWT, "expected_audience", mockFetch(mockPubKeys)),
    );
    t.assert(err.message.includes(message), `[${err}] contains [${message}]`);
  });
});
