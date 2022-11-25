import fetch from "node-fetch";
import { DesktopIAPOptions, Fetcher } from "../types";

export function openBrowser(browser: (url: string) => void, url: string): void {
  browser(url);
}

export async function getRefreshToken(
  browser: (url: string) => void,
  inputHandler: (question: string) => Promise<string>,
  fetcher: Fetcher = fetch,
  options: DesktopIAPOptions,
): Promise<string> {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${options.clientId}&response_type=code&scope=openid%20email&access_type=offline&redirect_uri=urn:ietf:wg:oauth:2.0:oob`;

  console.log("Open this URL if your browser didn't open automatically\n", url);

  openBrowser(browser, url);

  // await input from user
  const loginToken = await inputHandler(
    "Please input the token you received in the browser",
  );

  const oauthTokenBaseUrl = "https://www.googleapis.com/oauth2/v4/token";

  const body = {
    code: loginToken,
    client_id: options.clientId,
    client_secret: options.clientSecret,
    redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
    grant_type: "authorization_code",
  };

  const request = await fetcher(oauthTokenBaseUrl, {
    body: JSON.stringify(body),
    method: "POST",
  });

  const response = await request.json();

  return String(response["refresh_token"]);
}
