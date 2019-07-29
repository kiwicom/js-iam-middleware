import test from "ava";
import { Response } from "node-fetch";
import { getClientToken } from "./getClientToken";
import { DesktopIAPOptions } from "./types";

test("getClientToken", async (t) => {
  let nFetchCalls = 0;

  const mockFetch = async (): Promise<Response> => {
    nFetchCalls += 1;
    return new Response(
      JSON.stringify({
        // eslint-disable-next-line @typescript-eslint/camelcase
        id_token: "test",
      }),
    );
  };

  const mockIAPOptions: DesktopIAPOptions = {
    clientId: "Test",
    clientSecret: "TestSecret",
    iapClientId: "testiapClient",
  };

  const clientToken = await getClientToken(
    mockIAPOptions,
    "testrefreshtoken",
    mockFetch,
  );

  t.is(nFetchCalls, 1);
  t.is(clientToken, "test");
});
