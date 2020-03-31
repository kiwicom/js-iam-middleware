import test from "ava";
import { Response } from "node-fetch";
import { getUser } from "./getUser";

test("getUser caches results", async (t) => {
  let nRequests = 0;
  const mockFetch = (response: any) => async () => {
    nRequests += 1;
    return new Response(JSON.stringify(response));
  };

  const testUser = {
    employeeNumber: "1",
    firstName: "Jane",
    lastName: "Doe",
    email: "test@test.com",
    position: "",
    department: "",
    location: "",
    isVendor: false,
    teamMembership: [],
    orgStructure: "",
    manager: "",
    permissions: [],
  };

  const user = await getUser(
    "UA/1.0 (Kiwi.com test)",
    "Test",
    "test@test.com",
    "http://example.com",
    "test_token",
    mockFetch(testUser),
  );

  t.deepEqual(user, testUser);
  t.is(nRequests, 1);

  const user2 = await getUser(
    "UA/1.0 (Kiwi.com test)",
    "Test",
    "test@test.com",
    "http://example.com",
    "test_token",
    mockFetch(testUser),
  );

  t.deepEqual(user2, testUser);
  // The user from the previous request should be cached, so there shouldn't be
  // an extra request.
  t.is(nRequests, 1);
});
