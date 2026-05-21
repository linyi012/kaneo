import { useMutation } from "@tanstack/react-query";
import createProjectFromTemplate from "@/fetchers/project-template/create-project-from-template";
import { toast } from "@/lib/toast";

export function useCreateProjectFromTemplate() {
	return useMutation({
		mutationFn: createProjectFromTemplate,
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create project from template",
			);
		},
	});
}
