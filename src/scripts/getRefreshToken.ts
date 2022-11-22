import fetch from "node-fetch";
import { DesktopIAPOptions, Fetcher } from "../types";
import url from "url";

export function openBrowser(browser: (url: string) => void, url: string): void {
  browser(url);
}
export const isASCII = (value: string): boolean => /^[\x00-\x7F]+$/.test(value);

export async function getRefreshToken(
  redirectUrl: string,
  fetcher: Fetcher = fetch,
  options: DesktopIAPOptions,
  redirectUri: string,
): Promise<string> {
  const { code, error } = url.parse(redirectUrl, true).query;
  if (error) {
    // An error response e.g. error=access_denied
    console.log("Error:" + error);
    return "";
  } else {
    if (!code || code === "") {
      console.log("Authorization code is empty");
      return "";
    }
    if (Array.isArray(code)) {
      console.log("There is more then one authorization code in redirect url.");
      return "";
    }
    if (!isASCII(code)) {
      console.log("Code contains not allowed characters: " + code);
      return "";
    }

    const oauthTokenBaseUrl = "https://www.googleapis.com/oauth2/v4/token";

    const body = {
      code: code,
      client_id: options.clientId,
      client_secret: options.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };

    const request = await fetcher(oauthTokenBaseUrl, {
      body: JSON.stringify(body),
      method: "POST",
    });

    const response = await request.json();

    return String(response["refresh_token"]);
  }
}
