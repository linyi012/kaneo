import { client } from "@kaneo/libs";

async function createTemplate({
  workspaceId,
  name,
  description,
}: {
  workspaceId: string;
  name: string;
  description?: string;
}) {
  const response = await client["project-template"].$post({
    json: { workspaceId, name, description },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default createTemplate;
