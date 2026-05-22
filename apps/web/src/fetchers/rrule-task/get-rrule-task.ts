import { client } from "@kaneo/libs";

async function getRruleTask(id: string) {
  const response = await client["rrule-task"][":id"].$get({
    param: { id },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default getRruleTask;
