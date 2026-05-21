import { client } from "@kaneo/libs";

async function getTemplatesByWorkspace(workspaceId: string) {
	const response = await client["project-template"].workspace[
		":workspaceId"
	].$get({
		param: { workspaceId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default getTemplatesByWorkspace;
