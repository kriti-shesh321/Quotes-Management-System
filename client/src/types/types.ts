export type Role = 'user' | 'admin';

export interface User {
  id: number;
  email?: string | null;
  username: string;
  role: Role;
  created_at: string;
}

export interface Quote {
  id: number;
  text: string;
  author?: string | null;
  is_public: boolean;
  is_favorite: boolean;
  user_id?: number | null;
  username?: string | null;
  topic_id?: number | null;
  created_at: string;
}
