import fetch from "node-fetch";
import { User, userCache } from "./userCache";

function env(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw Error(`Environment variable '${name}' is not defined.`);
  }
  return val;
}

export async function getUser(serviceUA: string, email: string): Promise<User> {
  const cachedUser = userCache.get(email);
  if (cachedUser) {
    return cachedUser;
  }

  const iamURL = env("KIWI_IAM_URL").replace(/\/$/, "");
  const url = `${iamURL}/v1/user?email=${email}`;

  const response = await fetch(url, {
    headers: {
      Authorization: env("KIWI_IAM_TOKEN"),
      "User-Agent": serviceUA,
    },
  });
  const user = await response.json();

  userCache.set(user, 10 * 60);
  return user;
}
