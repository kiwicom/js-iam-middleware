import { Response } from "node-fetch";
import { sign } from "jsonwebtoken";

export const mockFetch = (response: any) => async (): Promise<Response> =>
  new Response(JSON.stringify(response));

export const keyPair = {
  private: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgevZzL1gdAFr88hb2
OF/2NxApJCzGCEDdfSp6VQO30hyhRANCAAQRWz+jn65BtOMvdyHKcvjBeBSDZH2r
1RTwjmYSi9R/zpBnuQ4EiMnCqfMPWiZqB4QdbAd0E7oH50VpuZ1P087G
-----END PRIVATE KEY-----`,
  public: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEVs/o5+uQbTjL3chynL4wXgUg2R9
q9UU8I5mEovUf86QZ7kOBIjJwqnzD1omageEHWwHdBO6B+dFabmdT9POxg==
-----END PUBLIC KEY-----`,
};

export const mockToken = (
  payload: { [key: string]: any },
  kid: string | null = "test",
): string =>
  sign(
    {
      ...payload,
      iat: new Date("10 Oct 2019").getTime(),
    },
    keyPair.private,
    {
      algorithm: "ES256",
      header: { kid },
    },
  );
