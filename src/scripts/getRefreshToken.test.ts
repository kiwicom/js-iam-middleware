import test from "ava";
import { openBrowser, getRefreshToken } from "./getRefreshToken";
import { Response } from "node-fetch";

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
  let nOpenBrowserCalls = 0;
  let nFetchCalls = 0;
  let nGetInputCalls = 0;
  const testUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?client_id=test_id&response_type=code&scope=openid%20email&access_type=offline&redirect_uri=urn:ietf:wg:oauth:2.0:oob";

  const iapOptions = {
    clientId: "test_id",
    clientSecret: "test",
    iapClientId: "not_used",
  };

  function mockOpenBrowser(url: string): void {
    nOpenBrowserCalls += 1;
    t.is(url, testUrl);
  }

  const mockFetch = (response: any) => async (): Promise<Response> => {
    nFetchCalls += 1;
    return new Response(JSON.stringify(response));
  };

  async function mockUserInput(): Promise<string> {
    nGetInputCalls += 1;
    return new Promise((resolve) => {
      resolve("test_client_id");
    });
  }

  const response = {
    refresh_token: "some_refresh_token",
  };

  const refreshToken = await getRefreshToken(
    mockOpenBrowser,
    mockUserInput,
    mockFetch(response),
    iapOptions,
  );

  t.is(nOpenBrowserCalls, 1);
  t.is(nFetchCalls, 1);
  t.is(nGetInputCalls, 1);
  t.is(refreshToken, "some_refresh_token");
});
