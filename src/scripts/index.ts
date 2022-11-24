#!/usr/bin/env node

import { GetString } from "mamushi";
import open from "open";
import fetch from "node-fetch";
import { getRefreshToken } from "./getRefreshToken";
import { handleUserInput } from "./inputHandler";

async function start(): Promise<void> {
  const options = {
    clientId: GetString("CLIENT_ID"),
    clientSecret: GetString("CLIENT_SECRET"),
    iapClientId: GetString("IAP_CLIENT_ID"),
  };
  const refreshToken = await getRefreshToken(
    open,
    handleUserInput,
    fetch,
    options,
  );

  console.log(`
Refresh token generated. Please save it to your .env file:
\`\`\`
IAP_REFRESH_TOKEN=${refreshToken}
\`\`\`
`);
}

start();
