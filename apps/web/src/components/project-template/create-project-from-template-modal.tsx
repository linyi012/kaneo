import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
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
import icons from "@/constants/project-icons";
import { useCreateProjectFromTemplate } from "@/hooks/mutations/project-template/use-create-project-from-template";
import generateProjectSlug from "@/lib/generate-project-id";
import { toast } from "@/lib/toast";
import type { ProjectTemplate } from "@/types/project-template";

type CreateProjectFromTemplateModalProps = {
  open: boolean;
  template: ProjectTemplate | null;
  workspaceId: string;
  onClose: () => void;
};

export default function CreateProjectFromTemplateModal({
  open,
  template,
  workspaceId,
  onClose,
}: CreateProjectFromTemplateModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const { mutateAsync: createProject, isPending } =
    useCreateProjectFromTemplate();

  const handleClose = () => {
    setName("");
    setSlug("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template || !name.trim()) return;

    try {
      const project = await createProject({
        templateId: template.id,
        workspaceId,
        name: name.trim(),
        icon: "Layout",
        slug: slug.trim() || generateProjectSlug(name),
      });
      toast.success(t("projectTemplate:createProject.success"));
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      handleClose();
      navigate({
        to: "/dashboard/workspace/$workspaceId/project/$projectId/board",
        params: { workspaceId, projectId: project.id },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("projectTemplate:createProject.error"),
      );
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(generateProjectSlug(newName));
  };

  const TemplateIcon = icons.Layout;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <DialogHeader>
            <DialogTitle>
              {t("projectTemplate:createProject.title", {
                name: template?.name ?? "",
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TemplateIcon className="w-4 h-4" />
              <span>
                {t("projectTemplate:createProject.taskCount", {
                  count: template?.tasks.length ?? 0,
                })}
              </span>
            </div>
            <Input
              value={name}
              onChange={handleNameChange}
              placeholder={t("common:modals.createProject.namePlaceholder")}
              autoFocus
            />
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={t("common:modals.createProject.slugPlaceholder")}
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
