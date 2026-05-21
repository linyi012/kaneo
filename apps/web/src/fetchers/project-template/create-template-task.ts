import { client } from "@kaneo/libs";

type CreateTemplateTaskInput = {
  templateId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  userId?: string;
  startDate?: string;
  dueDate?: string;
  labels?: { name: string; color: string }[];
};

async function createTemplateTask(input: CreateTemplateTaskInput) {
  const response = await client["project-template"][":templateId"].tasks.$post({
    param: { templateId: input.templateId },
    json: {
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      userId: input.userId,
      startDate: input.startDate,
      dueDate: input.dueDate,
      labels: input.labels,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default createTemplateTask;
