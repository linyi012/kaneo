import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import createProjectFromTemplate from "./controllers/create-project-from-template";
import createTemplate from "./controllers/create-template";
import createTemplateTask from "./controllers/create-template-task";
import deleteTemplate from "./controllers/delete-template";
import deleteTemplateTask from "./controllers/delete-template-task";
import getTemplateTask from "./controllers/get-template-task";
import getTemplatesByWorkspace from "./controllers/get-templates-by-workspace";
import updateTemplate from "./controllers/update-template";
import updateTemplateTask from "./controllers/update-template-task";

const projectTemplate = new Hono<{
  Variables: {
    userId: string;
  };
}>()
  .get(
    "/workspace/:workspaceId",
    describeRoute({
      operationId: "listProjectTemplates",
      tags: ["Project Templates"],
      description: "List project templates for a workspace",
      responses: {
        200: {
          description: "Templates with tasks",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ workspaceId: v.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("param");
      const templates = await getTemplatesByWorkspace(workspaceId);
      return c.json(templates);
    },
  )
  .post(
    "/",
    describeRoute({
      operationId: "createProjectTemplate",
      tags: ["Project Templates"],
      description: "Create a project template",
      responses: {
        200: {
          description: "Template created",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator(
      "json",
      v.object({
        workspaceId: v.string(),
        name: v.string(),
        description: v.optional(v.string()),
      }),
    ),
    async (c) => {
      const { workspaceId, name, description } = c.req.valid("json");
      const template = await createTemplate(workspaceId, name, description);
      return c.json(template);
    },
  )
  .patch(
    "/:id",
    describeRoute({
      operationId: "updateProjectTemplate",
      tags: ["Project Templates"],
      description: "Update a project template",
      responses: {
        200: {
          description: "Template updated",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    validator(
      "json",
      v.object({
        name: v.optional(v.string()),
        description: v.optional(v.nullable(v.string())),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");
      const template = await updateTemplate(id, body);
      return c.json(template);
    },
  )
  .delete(
    "/:id",
    describeRoute({
      operationId: "deleteProjectTemplate",
      tags: ["Project Templates"],
      description: "Delete a project template",
      responses: {
        200: {
          description: "Template deleted",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const template = await deleteTemplate(id);
      return c.json(template);
    },
  )
  .post(
    "/:templateId/tasks",
    describeRoute({
      operationId: "createProjectTemplateTask",
      tags: ["Project Templates"],
      description: "Create a task on a project template",
      responses: {
        200: {
          description: "Template task created",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ templateId: v.string() })),
    validator(
      "json",
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        status: v.optional(v.string()),
        priority: v.optional(v.string()),
        userId: v.optional(v.string()),
        startDate: v.optional(v.string()),
        dueDaysOffset: v.optional(v.nullable(v.number())),
        labels: v.optional(
          v.array(
            v.object({
              name: v.string(),
              color: v.string(),
            }),
          ),
        ),
      }),
    ),
    async (c) => {
      const { templateId } = c.req.valid("param");
      const body = c.req.valid("json");
      const task = await createTemplateTask({
        templateId,
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        userId: body.userId,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        dueDaysOffset: body.dueDaysOffset,
        labels: body.labels,
      });
      return c.json(task);
    },
  )
  .get(
    "/tasks/:taskId",
    describeRoute({
      operationId: "getProjectTemplateTask",
      tags: ["Project Templates"],
      description: "Get a project template task",
      responses: {
        200: {
          description: "Template task",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ taskId: v.string() })),
    async (c) => {
      const { taskId } = c.req.valid("param");
      const task = await getTemplateTask(taskId);
      return c.json(task);
    },
  )
  .patch(
    "/tasks/:taskId",
    describeRoute({
      operationId: "updateProjectTemplateTask",
      tags: ["Project Templates"],
      description: "Update a project template task",
      responses: {
        200: {
          description: "Template task updated",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ taskId: v.string() })),
    validator(
      "json",
      v.object({
        title: v.string(),
        description: v.string(),
        status: v.string(),
        priority: v.string(),
        userId: v.optional(v.nullable(v.string())),
        startDate: v.optional(v.nullable(v.string())),
        dueDaysOffset: v.optional(v.nullable(v.number())),
        position: v.number(),
        labels: v.optional(
          v.array(
            v.object({
              name: v.string(),
              color: v.string(),
            }),
          ),
        ),
      }),
    ),
    async (c) => {
      const { taskId } = c.req.valid("param");
      const body = c.req.valid("json");
      const task = await updateTemplateTask({
        id: taskId,
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        userId: body.userId,
        startDate: body.startDate ? new Date(body.startDate) : null,
        dueDaysOffset: body.dueDaysOffset,
        position: body.position,
        labels: body.labels,
      });
      return c.json(task);
    },
  )
  .delete(
    "/tasks/:taskId",
    describeRoute({
      operationId: "deleteProjectTemplateTask",
      tags: ["Project Templates"],
      description: "Delete a project template task",
      responses: {
        200: {
          description: "Template task deleted",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ taskId: v.string() })),
    async (c) => {
      const { taskId } = c.req.valid("param");
      const task = await deleteTemplateTask(taskId);
      return c.json(task);
    },
  )
  .post(
    "/:templateId/create-project",
    describeRoute({
      operationId: "createProjectFromTemplate",
      tags: ["Project Templates"],
      description: "Create a new project from a template",
      responses: {
        200: {
          description: "Project created from template",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ templateId: v.string() })),
    validator(
      "json",
      v.object({
        workspaceId: v.string(),
        name: v.string(),
        icon: v.string(),
        slug: v.string(),
      }),
    ),
    async (c) => {
      const { templateId } = c.req.valid("param");
      const body = c.req.valid("json");
      const project = await createProjectFromTemplate({
        templateId,
        workspaceId: body.workspaceId,
        name: body.name,
        icon: body.icon,
        slug: body.slug,
      });
      return c.json(project);
    },
  );

export default projectTemplate;
