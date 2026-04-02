import { describe, it, expect } from "vitest";
import { parseJwt, getJwtExpMs } from "@/lib/jwt";

const mockToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sZSI6IlVTRVIiLCJleHAiOjk5OTk5OTk5OTl9.signature";

describe("parseJwt", () => {
  it("parses a valid JWT", () => {
    const payload = parseJwt(mockToken);
    expect(payload).not.toBeNull();
    expect(payload.sub).toBe("1");
    expect(payload.role).toBe("USER");
  });

  it("returns null for null input", () => {
    expect(parseJwt(null)).toBeNull();
  });

  it("returns null for invalid token", () => {
    expect(parseJwt("not.a.token.at.all")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseJwt("")).toBeNull();
  });
});

describe("getJwtExpMs", () => {
  it("returns expiry in milliseconds", () => {
    const expMs = getJwtExpMs(mockToken);
    expect(expMs).toBe(9999999999000);
  });

  it("returns null for invalid token", () => {
    expect(getJwtExpMs("invalid")).toBeNull();
  });
});
