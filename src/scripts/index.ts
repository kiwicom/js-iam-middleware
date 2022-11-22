#!/usr/bin/env node

import { GetString } from "mamushi";
import open from "open";
import fetch from "node-fetch";
import { getRefreshToken } from "./getRefreshToken";
import http from "http";
import url from "url";

async function start(): Promise<void> {
  const options = {
    clientId: GetString("CLIENT_ID"),
    clientSecret: GetString("CLIENT_SECRET"),
    iapClientId: GetString("IAP_CLIENT_ID"),
  };
  const redirectUri =
    GetString("GOOGLE_REDIRECT_URI") || "http://localhost:3000";
  const serverPort = Number(GetString("OAUTH_SERVER_PORT")) || 3000;
  const authorizationUrl = url.resolve(
    "https://accounts.google.com/o/oauth2/v2/auth",
    url.format({
      query: {
        client_id: options.clientId,
        response_type: "code",
        scope: "openid email",
        access_type: "offline",
        include_granted_scopes: true,
        redirect_uri: redirectUri,
      },
    }),
  );

  http
    .createServer(async function (req, res) {
      // Receive the callback from Google's OAuth 2.0 server.
      if (req?.url?.startsWith("/?code")) {
        // Handle the OAuth 2.0 server response
        const refreshToken = await getRefreshToken(
          req.url,
          fetch,
          options,
          redirectUri,
        );

        const refreshTokenInfo = `\nRefresh token generated. Please save it to your .env file:\nIAP_REFRESH_TOKEN=${refreshToken}`;
        res.end(refreshTokenInfo, () => {
          console.log(refreshTokenInfo);

          // Ending server
          process.kill(process.pid, "SIGTERM");
        });
      }
    })
    .listen(serverPort, () => {
      console.log(`🚀 Server ready at ${serverPort}`);
      // open the browser to authorize url to start the workflow
      console.log(
        "Open this URL if your browser didn't open automatically\n",
        authorizationUrl,
      );
      open(authorizationUrl, { wait: false }).then((cp) => cp.unref());
    });
}

start().catch(console.error);
