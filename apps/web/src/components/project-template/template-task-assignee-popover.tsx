import { Check, UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetActiveWorkspaceUsers } from "@/hooks/queries/workspace-users/use-get-active-workspace-users";
import { cn } from "@/lib/cn";

type TemplateTaskAssigneePopoverProps = {
  workspaceId: string;
  assigneeId: string;
  onChange: (assigneeId: string) => void;
};

export default function TemplateTaskAssigneePopover({
  workspaceId,
  assigneeId,
  onChange,
}: TemplateTaskAssigneePopoverProps) {
  const { t } = useTranslation();
  const { data: workspaceUsers } = useGetActiveWorkspaceUsers(workspaceId);
  const selectedUser = workspaceUsers?.members?.find(
    (u) => u.userId === assigneeId,
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
            selectedUser
              ? "bg-accent/30 text-foreground"
              : "text-muted-foreground",
          )}
        >
          {selectedUser ? (
            <>
              <Avatar className="h-4 w-4">
                <AvatarImage
                  src={selectedUser.user?.image ?? ""}
                  alt={selectedUser.user?.name || ""}
                />
                <AvatarFallback className="text-[10px] font-medium border border-border/30">
                  {selectedUser.user?.name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span>{selectedUser.user?.name}</span>
            </>
          ) : (
            <>
              <UserIcon className="w-3.5 h-3.5" />
              <span>{t("common:modals.createTask.assign")}</span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start">
        <div className="space-y-1">
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left transition-colors h-8"
            onClick={() => onChange("")}
          >
            <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center">
              <span className="text-[10px] font-medium text-muted-foreground">
                ?
              </span>
            </div>
            <span className="text-sm">
              {t("common:modals.createTask.assignUnassigned")}
            </span>
            {!assigneeId && <Check className="ml-auto h-4 w-4" />}
          </button>
          {workspaceUsers?.members?.map((member) => (
            <button
              key={member.userId}
              type="button"
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left transition-colors h-8"
              onClick={() => onChange(member.userId || "")}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={member.user?.image ?? ""}
                  alt={member.user?.name || ""}
                />
                <AvatarFallback className="text-xs font-medium border border-border/30">
                  {member.user?.name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{member.user?.name}</span>
              {assigneeId === member.userId && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
