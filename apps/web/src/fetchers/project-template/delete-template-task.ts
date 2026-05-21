import { client } from "@kaneo/libs";

async function deleteTemplateTask(taskId: string) {
	const response = await client["project-template"].tasks[":taskId"].$delete({
		param: { taskId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default deleteTemplateTask;
