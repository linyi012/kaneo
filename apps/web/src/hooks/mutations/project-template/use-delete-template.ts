import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteTemplate from "@/fetchers/project-template/delete-template";
import { toast } from "@/lib/toast";

export function useDeleteTemplate(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteTemplate,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["project-templates", workspaceId],
			});
			toast.success("Template deleted");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete template",
			);
		},
	});
}
