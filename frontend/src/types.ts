export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in-progress" | "done";
export type Page = "landing" | "auth" | "loading" | "home" | "tasks" | "analytics" | "about";

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  tags: string;
}

export type SortKey = "createdAt" | "dueDate" | "priority" | "title";
export type FilterStatus = "all" | Status;
