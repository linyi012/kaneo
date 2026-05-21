import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateTemplateTask } from "@/hooks/mutations/project-template/use-create-template-task";
import { getPriorityLabel } from "@/lib/i18n/domain";
import { getPriorityIcon } from "@/lib/priority";

const PRIORITIES = [
	"no-priority",
	"low",
	"medium",
	"high",
	"urgent",
] as const;

type CreateTemplateTaskModalProps = {
	open: boolean;
	templateId: string;
	workspaceId: string;
	onClose: () => void;
};

export default function CreateTemplateTaskModal({
	open,
	templateId,
	workspaceId,
	onClose,
}: CreateTemplateTaskModalProps) {
	const { t } = useTranslation();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState("to-do");
	const [priority, setPriority] = useState("no-priority");
	const { mutateAsync: createTask, isPending } =
		useCreateTemplateTask(workspaceId);

	const handleClose = () => {
		setTitle("");
		setDescription("");
		setStatus("to-do");
		setPriority("no-priority");
		onClose();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;
		await createTask({
			templateId,
			title: title.trim(),
			description,
			status,
			priority,
		});
		handleClose();
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
			<DialogContent className="max-w-lg">
				<form onSubmit={(e) => void handleSubmit(e)}>
					<DialogHeader>
						<DialogTitle>
							{t("projectTemplate:createTask.title")}
						</DialogTitle>
					</DialogHeader>
					<div className="py-4 space-y-3">
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder={t("projectTemplate:task.title")}
							autoFocus
						/>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder={t("projectTemplate:task.description")}
							rows={4}
						/>
						<div className="grid grid-cols-2 gap-3">
							<Select value={status} onValueChange={setStatus}>
								<SelectTrigger>
									<SelectValue
										placeholder={t("projectTemplate:task.status")}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="to-do">to-do</SelectItem>
									<SelectItem value="in-progress">in-progress</SelectItem>
									<SelectItem value="in-review">in-review</SelectItem>
									<SelectItem value="done">done</SelectItem>
								</SelectContent>
							</Select>
							<Select value={priority} onValueChange={setPriority}>
								<SelectTrigger>
									<SelectValue
										placeholder={t("projectTemplate:task.priority")}
									/>
								</SelectTrigger>
								<SelectContent>
									{PRIORITIES.map((p) => (
										<SelectItem key={p} value={p}>
											<span className="flex items-center gap-2">
												{getPriorityIcon(p)}
												{getPriorityLabel(p)}
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleClose}>
							{t("common:actions.cancel")}
						</Button>
						<Button type="submit" disabled={isPending || !title.trim()}>
							{t("projectTemplate:actions.create")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
