import { client } from "@kaneo/libs";

async function deleteTemplate(templateId: string) {
  const response = await client["project-template"][":id"].$delete({
    param: { id: templateId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default deleteTemplate;
