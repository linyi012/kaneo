import { client } from "@kaneo/libs";

async function getRruleTasksByWorkspace(workspaceId: string) {
  const response = await client["rrule-task"].workspace[":workspaceId"].$get({
    param: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default getRruleTasksByWorkspace;
