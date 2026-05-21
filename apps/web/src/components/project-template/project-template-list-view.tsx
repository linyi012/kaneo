import { ChevronRight, FileStack, Plus, Rocket, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteTemplate } from "@/hooks/mutations/project-template/use-delete-template";
import { cn } from "@/lib/cn";
import type { ProjectTemplate } from "@/types/project-template";
import CreateProjectFromTemplateModal from "./create-project-from-template-modal";
import CreateTemplateTaskModal from "./create-template-task-modal";
import TemplateTaskRow from "./template-task-row";

type ProjectTemplateListViewProps = {
	templates: ProjectTemplate[];
	workspaceId: string;
	onTaskClick: (taskId: string) => void;
};

export default function ProjectTemplateListView({
	templates,
	workspaceId,
	onTaskClick,
}: ProjectTemplateListViewProps) {
	const { t } = useTranslation();
	const { mutateAsync: deleteTemplate } = useDeleteTemplate(workspaceId);
	const [expandedSections, setExpandedSections] = useState<
		Record<string, boolean>
	>(() => {
		const sections: Record<string, boolean> = {};
		for (const template of templates) {
			sections[template.id] = true;
		}
		return sections;
	});
	const [taskModalTemplateId, setTaskModalTemplateId] = useState<string | null>(
		null,
	);
	const [projectModalTemplate, setProjectModalTemplate] =
		useState<ProjectTemplate | null>(null);
	const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

	const toggleSection = (templateId: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[templateId]: !prev[templateId],
		}));
	};

	const handleConfirmDelete = async () => {
		if (!deleteTemplateId) return;
		await deleteTemplate(deleteTemplateId);
		setDeleteTemplateId(null);
	};

	if (templates.length === 0) {
		return (
			<div className="py-12 px-4 text-center text-sm text-muted-foreground">
				<FileStack className="w-8 h-8 mx-auto mb-3 opacity-50" />
				<p>{t("projectTemplate:empty")}</p>
			</div>
		);
	}

	return (
		<>
			<div className="w-full h-full overflow-auto bg-muted/20">
				<div className="divide-y divide-border/50">
					{templates.map((template) => (
						<div
							key={template.id}
							className="border-b border-border/50 transition-all duration-200 overflow-auto"
						>
							<div className="flex items-center justify-between py-2 px-4 bg-muted/60 border-b border-border/50">
								<button
									type="button"
									onClick={() => toggleSection(template.id)}
									className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground transition-colors"
								>
									<ChevronRight
										className={cn(
											"w-3 h-3 transition-transform",
											expandedSections[template.id] && "rotate-90",
										)}
									/>
									<div className="flex items-center gap-2 h-4">
										<FileStack className="w-3.5 h-3.5 text-muted-foreground" />
										<span className="mt-1 mr-1">{template.name}</span>
										<span className="text-xs text-muted-foreground mt-0.5">
											{template.tasks.length}
										</span>
									</div>
								</button>

								<div className="flex items-center gap-1">
									<button
										type="button"
										onClick={() => setProjectModalTemplate(template)}
										className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
										title={t("projectTemplate:useTemplate")}
									>
										<Rocket className="w-3 h-3" />
									</button>
									<button
										type="button"
										onClick={() => setTaskModalTemplateId(template.id)}
										className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
										title={t("projectTemplate:addTask")}
									>
										<Plus className="w-3 h-3" />
									</button>
									<button
										type="button"
										onClick={() => setDeleteTemplateId(template.id)}
										className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-destructive transition-colors"
										title={t("projectTemplate:deleteTemplate")}
									>
										<Trash2 className="w-3 h-3" />
									</button>
								</div>
							</div>

							{expandedSections[template.id] && (
								<div className="bg-card">
									{template.tasks.map((task) => (
										<TemplateTaskRow
											key={task.id}
											task={task}
											templateName={template.name}
											workspaceId={workspaceId}
											onClick={() => onTaskClick(task.id)}
										/>
									))}
									{template.tasks.length === 0 && (
										<div className="py-6 px-4 text-center text-xs text-muted-foreground">
											{t("tasks:listView.noTasks")}
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{taskModalTemplateId && (
				<CreateTemplateTaskModal
					open={Boolean(taskModalTemplateId)}
					templateId={taskModalTemplateId}
					workspaceId={workspaceId}
					onClose={() => setTaskModalTemplateId(null)}
				/>
			)}

			<CreateProjectFromTemplateModal
				open={Boolean(projectModalTemplate)}
				template={projectModalTemplate}
				workspaceId={workspaceId}
				onClose={() => setProjectModalTemplate(null)}
			/>

			<AlertDialog
				open={Boolean(deleteTemplateId)}
				onOpenChange={(open) => !open && setDeleteTemplateId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("projectTemplate:deleteTemplateConfirm.title")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("projectTemplate:deleteTemplateConfirm.description")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogClose>
							<Button variant="outline" size="sm">
								{t("common:actions.cancel")}
							</Button>
						</AlertDialogClose>
						<AlertDialogClose onClick={() => void handleConfirmDelete()}>
							<Button variant="destructive" size="sm">
								{t("common:actions.delete")}
							</Button>
						</AlertDialogClose>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
