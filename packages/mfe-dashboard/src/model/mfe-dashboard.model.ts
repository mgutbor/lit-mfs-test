export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface DashboardStats {
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  totalPosts: number;
}
