import { client } from "@kaneo/libs";

async function createProjectFromTemplate({
	templateId,
	workspaceId,
	name,
	icon,
	slug,
}: {
	templateId: string;
	workspaceId: string;
	name: string;
	icon: string;
	slug: string;
}) {
	const response = await client["project-template"][":templateId"][
		"create-project"
	].$post({
		param: { templateId },
		json: { workspaceId, name, icon, slug },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default createProjectFromTemplate;
