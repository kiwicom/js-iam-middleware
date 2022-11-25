import test from "ava";
import { getClientToken } from "./getClientToken";
import { DesktopIAPOptions } from "./types";
import { Response } from "node-fetch";

test("getClientToken", async (t) => {
  let nFetchCalls = 0;

  const mockFetch = async (): Promise<Response> => {
    nFetchCalls += 1;
    return new Response(
      JSON.stringify({
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
    // This should be client side, so the types don't exactly match between node-fetch's Response
    // and Response. However, it's easier to do it this way to run the tests for now.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockFetch,
  );

  t.is(nFetchCalls, 1);
  t.is(clientToken, "test");
});
