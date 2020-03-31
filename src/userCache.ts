// https://gitlab.skypicker.com/platform/security/iam/blob/master/swagger.yml#L35
export interface User {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  email: string;
  location: string;
  isVendor: boolean;
  teamMembership: string[];
  orgStructure: string;
  manager: string;
  permissions: string[];
}

interface Cache {
  [identifier: string]: {
    expiration: number;
    user: User;
  };
}

class UserCache {
  cache: Cache = {};

  set(user: User, service: string, lifespan: number): void {
    this.cache[`${user.email}:${service}`] = {
      expiration: Date.now() + lifespan * 1000,
      user,
    };
  }

  get(identifier: string): User | null {
    const entry = this.cache[identifier];
    if (!entry) {
      return null;
    }

    if (entry.expiration <= Date.now()) {
      this.del(identifier);
      return null;
    }

    return entry.user;
  }

  del(identifier: string): void {
    delete this.cache[identifier];
  }
}

export const userCache = new UserCache();
