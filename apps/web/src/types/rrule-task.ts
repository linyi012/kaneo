export type RruleTaskLabel = {
  id: string;
  name: string;
  color: string;
};

export type RruleTask = {
  id: string;
  projectId: string;
  title: string;
  number: number | null;
  description: string | null;
  status: string;
  priority: string | null;
  startDate: string | null;
  dueDaysOffset: number | null;
  rrule: string;
  nextRunAt: string | null;
  position: number | null;
  createdAt: string;
  updatedAt?: string;
  userId: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  labels?: RruleTaskLabel[];
};

export type ProjectWithRruleTasks = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  rruleTasks: RruleTask[];
};
