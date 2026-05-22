export type ProjectTemplateTaskLabel = {
  id: string;
  name: string;
  color: string;
};

export type ProjectTemplateTask = {
  id: string;
  templateId: string;
  title: string;
  number: number | null;
  description: string | null;
  status: string;
  priority: string | null;
  startDate: string | null;
  dueDaysOffset: number | null;
  position: number | null;
  createdAt: string;
  updatedAt?: string;
  userId: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  labels?: ProjectTemplateTaskLabel[];
};

export type ProjectTemplate = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: ProjectTemplateTask[];
};
