import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createUniqueWorkspaceSlug,
  createWorkspaceBaseSlug,
} from "./create-workspace-slug";

describe("createWorkspaceBaseSlug", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns slug derived from Latin name", () => {
    expect(createWorkspaceBaseSlug("Acme Corp")).toBe("acme-corp");
  });

  it("returns workspace with random suffix when name has no slug characters", () => {
    expect(createWorkspaceBaseSlug("我的工作区")).toMatch(
      /^workspace-[a-f0-9]{12}$/,
    );
  });

  it("uses predictable suffix when randomUUID is mocked", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "abc12345-6789-0000-0000-000000000000",
    );

    expect(createWorkspaceBaseSlug("!!!")).toBe("workspace-abc123456789");
  });
});

describe("createUniqueWorkspaceSlug", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns base slug when unused", () => {
    expect(createUniqueWorkspaceSlug("Acme", [])).toBe("acme");
  });

  it("appends suffix when base slug is taken", () => {
    expect(createUniqueWorkspaceSlug("Acme", ["acme"])).toMatch(
      /^acme-[a-f0-9]{12}$/,
    );
  });

  it("generates a new slug when empty-name base is already used", () => {
    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce("abc12345-6789-0000-0000-000000000000")
      .mockReturnValueOnce("def67890-1234-0000-0000-000000000000");

    const slug = createUniqueWorkspaceSlug("中文", ["workspace-abc123456789"]);

    expect(slug).toBe("workspace-abc123456789-def678901234");
  });
});
