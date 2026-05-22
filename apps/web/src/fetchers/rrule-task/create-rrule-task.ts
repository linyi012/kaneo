import { client } from "@kaneo/libs";

type CreateRruleTaskInput = {
  projectId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  userId?: string;
  startDate?: string;
  dueDaysOffset?: number | null;
  rrule: string;
  labels?: { name: string; color: string }[];
};

async function createRruleTask(input: CreateRruleTaskInput) {
  const response = await client["rrule-task"].$post({
    json: input,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default createRruleTask;
