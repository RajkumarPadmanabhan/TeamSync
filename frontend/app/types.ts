export type Role = 'ADMIN' | 'MEMBER';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  department: string;
  avatar_url?: string | null;
  is_staff?: boolean;
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  created_by: number;
  created_by_detail?: User;
  members: number[];
  members_detail?: User[];
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';

export interface DeadlineHistoryItem {
  id: number;
  task: number;
  previous_deadline?: string | null;
  new_deadline?: string | null;
  changed_by?: number | null;
  changed_by_detail?: User | null;
  changed_at: string;
  reason: string;
}

export interface TaskComment {
  id: number;
  task: number;
  author: number;
  author_detail?: User;
  content: string;
  created_at: string;
}

export interface TaskActivity {
  id: number;
  task: number;
  user?: number | null;
  user_detail?: User | null;
  activity_type: 'CREATED' | 'STATUS_CHANGED' | 'DEADLINE_CHANGED' | 'REASSIGNED' | 'COMMENT_ADDED' | 'FILE_ATTACHED';
  description: string;
  created_at: string;
}

export interface TaskAttachment {
  id: number;
  task: number;
  uploaded_by?: number | null;
  uploaded_by_detail?: User | null;
  file: string;
  file_name: string;
  file_size: number;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  project: number;
  project_name?: string;
  assigned_to?: number | null;
  assigned_to_detail?: User | null;
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: string | null;
  created_by: number;
  created_by_detail?: User;
  created_at: string;
  updated_at: string;
  deadline_history_count: number;
  comments_count: number;
  activity_count: number;
  attachments_count: number;
}

export interface DashboardStats {
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  todo_tasks: number;
  in_review_tasks: number;
  completion_rate: number;
  total_deadline_changes: number;
  my_tasks_count: number;
  my_completed_tasks: number;
}

export interface ProjectInvitation {
  id: number;
  project: number;
  project_detail?: Project;
  invited_user: number;
  invited_user_detail?: User;
  sender: number;
  sender_detail?: User;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message: string;
  created_at: string;
  updated_at: string;
}
