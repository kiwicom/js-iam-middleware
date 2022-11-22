import test from "ava";
import { openBrowser, getRefreshToken, isASCII } from "./getRefreshToken";
import { Response } from "node-fetch";

test("isASCII", (t) => {
  t.truthy(isASCII("nice456452413%"));
  t.falsy(isASCII("£"));
});

test("opens a browser window", (t) => {
  let nOpenBrowserCalls = 0;
  const testUrl = "http://test.com/";

  function mockOpenBrowser(url: string): void {
    nOpenBrowserCalls += 1;
    t.is(url, testUrl);
  }
  openBrowser(mockOpenBrowser, testUrl);

  t.is(nOpenBrowserCalls, 1);
});

test("getRefreshToken", async (t) => {
  let nFetchCalls = 0;

  const iapOptions = {
    clientId: "test_id",
    clientSecret: "test",
    iapClientId: "not_used",
  };

  const mockFetch = (response: any) => async (): Promise<Response> => {
    nFetchCalls += 1;
    return new Response(JSON.stringify(response));
  };

  const response = {
    refresh_token: "some_refresh_token",
  };

  const refreshToken = await getRefreshToken(
    "?code=4/0Afge",
    mockFetch(response),
    iapOptions,
    "localhost",
  );

  t.is(nFetchCalls, 1);
  t.is(refreshToken, "some_refresh_token");
});
