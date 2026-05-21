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
import { useCreateTemplate } from "@/hooks/mutations/project-template/use-create-template";

type CreateTemplateModalProps = {
	open: boolean;
	workspaceId: string;
	onClose: () => void;
};

export default function CreateTemplateModal({
	open,
	workspaceId,
	onClose,
}: CreateTemplateModalProps) {
	const { t } = useTranslation();
	const [name, setName] = useState("");
	const { mutateAsync: createTemplate, isPending } =
		useCreateTemplate(workspaceId);

	const handleClose = () => {
		setName("");
		onClose();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		await createTemplate({ workspaceId, name: name.trim() });
		handleClose();
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
			<DialogContent>
				<form onSubmit={(e) => void handleSubmit(e)}>
					<DialogHeader>
						<DialogTitle>{t("projectTemplate:createTemplate.title")}</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t("projectTemplate:createTemplate.namePlaceholder")}
							autoFocus
						/>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleClose}>
							{t("common:actions.cancel")}
						</Button>
						<Button type="submit" disabled={isPending || !name.trim()}>
							{t("projectTemplate:actions.create")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
