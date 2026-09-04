import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Security tests for account deletion.
 *
 * The properties worth protecting here are the ones that would be catastrophic
 * if they regressed: that an anonymous caller cannot delete anything, and that
 * the account being deleted is always the session's own -- never an id taken
 * from the request body.
 */

const getUserFromRequest = vi.fn();
const rpc = vi.fn();
const adminDeleteUser = vi.fn();
const storageList = vi.fn();
const storageRemove = vi.fn();

vi.mock("@/lib/auth/request-user", () => ({
  getUserFromRequest: (...args: unknown[]) => getUserFromRequest(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ rpc: (...args: unknown[]) => rpc(...args) }),
}));

vi.mock("@/lib/supabase/service", () => ({
  requireServiceClient: () => ({
    auth: { admin: { deleteUser: (...a: unknown[]) => adminDeleteUser(...a) } },
    storage: {
      from: () => ({
        list: (...a: unknown[]) => storageList(...a),
        remove: (...a: unknown[]) => storageRemove(...a),
      }),
    },
  }),
}));

const { POST } = await import("./route");

function req(body?: unknown): Request {
  return new Request("http://localhost/api/account/delete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  rpc.mockResolvedValue({ error: null });
  adminDeleteUser.mockResolvedValue({ error: null });
  storageList.mockResolvedValue({ data: [], error: null });
  storageRemove.mockResolvedValue({ error: null });
});

describe("POST /api/account/delete", () => {
  it("rejects an unauthenticated caller with 401 and deletes nothing", async () => {
    getUserFromRequest.mockResolvedValue(null);

    const res = await POST(req());

    expect(res.status).toBe(401);
    expect(adminDeleteUser).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("deletes the session's own account", async () => {
    getUserFromRequest.mockResolvedValue({ id: "user-self" });

    const res = await POST(req());

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith("delete_own_account");
    expect(adminDeleteUser).toHaveBeenCalledWith("user-self");
  });

  it("ignores any user id supplied in the body and deletes only the session user", async () => {
    getUserFromRequest.mockResolvedValue({ id: "user-self" });

    // A hostile client naming somebody else's account.
    await POST(req({ userId: "victim", user_id: "victim", id: "victim" }));

    expect(adminDeleteUser).toHaveBeenCalledWith("user-self");
    expect(adminDeleteUser).not.toHaveBeenCalledWith("victim");
  });

  it("passes no argument to the RPC, so the database derives the target from auth.uid()", async () => {
    getUserFromRequest.mockResolvedValue({ id: "user-self" });

    await POST(req({ userId: "victim" }));

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc.mock.calls[0]).toEqual(["delete_own_account"]);
  });

  it("does not delete the auth user when anonymisation fails", async () => {
    getUserFromRequest.mockResolvedValue({ id: "user-self" });
    rpc.mockResolvedValue({ error: { message: "boom" } });

    const res = await POST(req());

    expect(res.status).toBe(500);
    expect(adminDeleteUser).not.toHaveBeenCalled();
  });

  it("returns a friendly message and never leaks the underlying error", async () => {
    getUserFromRequest.mockResolvedValue({ id: "user-self" });
    adminDeleteUser.mockResolvedValue({
      error: { message: "duplicate key value violates constraint users_pkey" },
    });

    const res = await POST(req());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
    expect(body.error).not.toMatch(/constraint|users_pkey|duplicate/i);
  });

  it("still deletes the account when storage cleanup fails", async () => {
    getUserFromRequest.mockResolvedValue({ id: "user-self" });
    storageList.mockRejectedValue(new Error("storage down"));

    const res = await POST(req());

    expect(res.status).toBe(200);
    expect(adminDeleteUser).toHaveBeenCalledWith("user-self");
  });
});
