import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { rescheduleRRuleTasks } from "../scheduler/rrule-task-runner";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createRruleTask from "./controllers/create-rrule-task";
import deleteRruleTask from "./controllers/delete-rrule-task";
import getRruleTask from "./controllers/get-rrule-task";
import getRruleTasksByWorkspace from "./controllers/get-rrule-tasks-by-workspace";
import updateRruleTask from "./controllers/update-rrule-task";

const rruleTaskLabelSchema = v.object({
  name: v.string(),
  color: v.string(),
});

const rruleTask = new Hono<{
  Variables: {
    userId: string;
  };
}>()
  .get(
    "/workspace/:workspaceId",
    describeRoute({
      operationId: "listRruleTasksByWorkspace",
      tags: ["RRule Tasks"],
      description: "List projects with RRule tasks for a workspace",
      responses: {
        200: {
          description: "Projects with RRule tasks",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromParam("workspaceId"),
    async (c) => {
      const { workspaceId } = c.req.valid("param");
      const projects = await getRruleTasksByWorkspace(workspaceId);
      return c.json(projects);
    },
  )
  .post(
    "/",
    describeRoute({
      operationId: "createRruleTask",
      tags: ["RRule Tasks"],
      description: "Create an RRule task",
      responses: {
        200: {
          description: "RRule task created",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator(
      "json",
      v.object({
        projectId: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        status: v.optional(v.string()),
        priority: v.optional(v.string()),
        userId: v.optional(v.string()),
        startDate: v.optional(v.string()),
        dueDaysOffset: v.optional(v.nullable(v.number())),
        rrule: v.string(),
        labels: v.optional(v.array(rruleTaskLabelSchema)),
      }),
    ),
    workspaceAccess.fromProject("projectId"),
    async (c) => {
      const body = c.req.valid("json");
      const task = await createRruleTask({
        projectId: body.projectId,
        createdByUserId: c.get("userId"),
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        userId: body.userId,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        dueDaysOffset: body.dueDaysOffset,
        rrule: body.rrule,
        labels: body.labels,
      });
      await rescheduleRRuleTasks();
      return c.json(task);
    },
  )
  .get(
    "/:id",
    describeRoute({
      operationId: "getRruleTask",
      tags: ["RRule Tasks"],
      description: "Get an RRule task by ID",
      responses: {
        200: {
          description: "RRule task",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    workspaceAccess.fromRruleTask("id"),
    async (c) => {
      const { id } = c.req.valid("param");
      const task = await getRruleTask(id);
      return c.json(task);
    },
  )
  .patch(
    "/:id",
    describeRoute({
      operationId: "updateRruleTask",
      tags: ["RRule Tasks"],
      description: "Update an RRule task",
      responses: {
        200: {
          description: "RRule task updated",
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
        title: v.string(),
        description: v.string(),
        status: v.string(),
        priority: v.string(),
        userId: v.optional(v.nullable(v.string())),
        startDate: v.optional(v.nullable(v.string())),
        dueDaysOffset: v.optional(v.nullable(v.number())),
        rrule: v.string(),
        position: v.number(),
        labels: v.optional(v.array(rruleTaskLabelSchema)),
      }),
    ),
    workspaceAccess.fromRruleTask("id"),
    async (c) => {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");
      const task = await updateRruleTask({
        id,
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        userId: body.userId,
        startDate: body.startDate ? new Date(body.startDate) : null,
        dueDaysOffset: body.dueDaysOffset,
        rrule: body.rrule,
        position: body.position,
        labels: body.labels,
      });
      await rescheduleRRuleTasks();
      return c.json(task);
    },
  )
  .delete(
    "/:id",
    describeRoute({
      operationId: "deleteRruleTask",
      tags: ["RRule Tasks"],
      description: "Delete an RRule task",
      responses: {
        200: {
          description: "RRule task deleted",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    workspaceAccess.fromRruleTask("id"),
    async (c) => {
      const { id } = c.req.valid("param");
      const task = await deleteRruleTask(id);
      await rescheduleRRuleTasks();
      return c.json(task);
    },
  );

export default rruleTask;
