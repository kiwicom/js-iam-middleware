import { DesktopIAPOptions } from "./types";

const oauthTokenBaseUrl = "https://www.googleapis.com/oauth2/v4/token";

export async function getClientToken(
  options: DesktopIAPOptions,
  refreshToken: string,
  fetcher: Function = fetch,
): Promise<string> {
  const body = {
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_id: options.clientId,
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_secret: options.clientSecret,
    // eslint-disable-next-line @typescript-eslint/camelcase
    refresh_token: refreshToken,
    // eslint-disable-next-line @typescript-eslint/camelcase
    grant_type: "refresh_token",
    // eslint-disable-next-line @typescript-eslint/camelcase
    audience: options.iapClientId,
  };

  const request = await fetcher(oauthTokenBaseUrl, {
    body: JSON.stringify(body),
    method: "POST",
  });

  const response = await request.json();

  return String(response["id_token"]);
}
