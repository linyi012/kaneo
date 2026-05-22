import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import db, { schema } from "../../apps/api/src/database";
import { createApp } from "../../apps/api/src/index";
import { mockAnonymousSession, mockAuthenticatedSession } from "./helpers/auth";
import { resetTestDatabase } from "./helpers/database";
import { createWorkspaceMember } from "./helpers/fixtures";

describe("API integration: project templates", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  it("rejects unauthenticated template list requests", async () => {
    mockAnonymousSession();
    const { app } = createApp();

    const response = await app.request(
      "/api/project-template/workspace/workspace-missing",
    );

    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toBe("Unauthorized");
  });

  it("lists templates for a workspace member", async () => {
    const member = await createWorkspaceMember();
    mockAuthenticatedSession(member.user);
    const { app } = createApp();

    const [template] = await db
      .insert(schema.projectTemplateTable)
      .values({
        workspaceId: member.workspace.id,
        name: "Sprint Template",
      })
      .returning();

    const response = await app.request(
      `/api/project-template/workspace/${member.workspace.id}`,
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { id: string; name: string }[];
    expect(payload).toHaveLength(1);
    expect(payload[0]).toMatchObject({
      id: template.id,
      name: "Sprint Template",
    });
  });

  it("rejects template list for users outside the workspace", async () => {
    const member = await createWorkspaceMember();
    const outsiderId = "user-outsider-template";

    const [outsider] = await db
      .insert(schema.userTable)
      .values({
        id: outsiderId,
        email: `${outsiderId}@example.com`,
        emailVerified: true,
        name: "Outsider",
      })
      .returning();

    mockAuthenticatedSession(outsider);
    const { app } = createApp();

    const response = await app.request(
      `/api/project-template/workspace/${member.workspace.id}`,
    );

    expect(response.status).toBe(403);
    await expect(response.text()).resolves.toBe(
      "You don't have access to this workspace",
    );
  });

  it("creates a template for a workspace member", async () => {
    const member = await createWorkspaceMember();
    mockAuthenticatedSession(member.user);
    const { app } = createApp();

    const response = await app.request("/api/project-template", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        workspaceId: member.workspace.id,
        name: "New Template",
        description: "Template description",
      }),
    });

    expect(response.status).toBe(200);
    const payload =
      (await response.json()) as typeof schema.projectTemplateTable.$inferSelect;

    expect(payload).toMatchObject({
      workspaceId: member.workspace.id,
      name: "New Template",
      description: "Template description",
    });
  });

  it("rejects template creation for users outside the workspace", async () => {
    const member = await createWorkspaceMember();
    const outsiderId = "user-outsider-create-template";

    const [outsider] = await db
      .insert(schema.userTable)
      .values({
        id: outsiderId,
        email: `${outsiderId}@example.com`,
        emailVerified: true,
        name: "Outsider",
      })
      .returning();

    mockAuthenticatedSession(outsider);
    const { app } = createApp();

    const response = await app.request("/api/project-template", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        workspaceId: member.workspace.id,
        name: "Forbidden Template",
      }),
    });

    expect(response.status).toBe(403);
    await expect(response.text()).resolves.toBe(
      "You don't have access to this workspace",
    );
  });

  it("rejects template update for users outside the workspace", async () => {
    const member = await createWorkspaceMember();
    const outsiderId = "user-outsider-update-template";

    const [template] = await db
      .insert(schema.projectTemplateTable)
      .values({
        workspaceId: member.workspace.id,
        name: "Protected Template",
      })
      .returning();

    const [outsider] = await db
      .insert(schema.userTable)
      .values({
        id: outsiderId,
        email: `${outsiderId}@example.com`,
        emailVerified: true,
        name: "Outsider",
      })
      .returning();

    mockAuthenticatedSession(outsider);
    const { app } = createApp();

    const response = await app.request(`/api/project-template/${template.id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: "Hijacked Template",
      }),
    });

    expect(response.status).toBe(403);
    await expect(response.text()).resolves.toBe(
      "You don't have access to this workspace",
    );

    const persisted = await db.query.projectTemplateTable.findFirst({
      where: eq(schema.projectTemplateTable.id, template.id),
    });
    expect(persisted?.name).toBe("Protected Template");
  });

  it("rejects template delete for users outside the workspace", async () => {
    const member = await createWorkspaceMember();
    const outsiderId = "user-outsider-delete-template";

    const [template] = await db
      .insert(schema.projectTemplateTable)
      .values({
        workspaceId: member.workspace.id,
        name: "Protected Template",
      })
      .returning();

    const [outsider] = await db
      .insert(schema.userTable)
      .values({
        id: outsiderId,
        email: `${outsiderId}@example.com`,
        emailVerified: true,
        name: "Outsider",
      })
      .returning();

    mockAuthenticatedSession(outsider);
    const { app } = createApp();

    const response = await app.request(`/api/project-template/${template.id}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(403);
    await expect(response.text()).resolves.toBe(
      "You don't have access to this workspace",
    );

    const persisted = await db.query.projectTemplateTable.findFirst({
      where: eq(schema.projectTemplateTable.id, template.id),
    });
    expect(persisted).toBeDefined();
  });
});
