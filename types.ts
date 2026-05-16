// Shared types for GrantForge

export interface UserProfile {
  name: string;
  email?: string;
  immigrationStatus: string;
  school: string;
  major: string;
  location: string;
  gpa?: string;
  enrollmentStatus?: string;
  circumstances: string[];
  // Legacy alias
  visaStatus?: string;
}

export interface Grant {
  id: string;
  name: string;
  amount: string;
  deadline: string;
  status: 'eligible' | 'ineligible' | 'new';
  requirements: string[];
  matchScore?: number;
  matchReason?: string;
  warning?: string;
  reason?: string;
}

export interface Delta {
  id: string;
  type: 'status_change' | 'new_grant' | 'deadline_change' | 'requirement_change';
  from: string | null;
  to: string;
  reason: string;
  grant: Grant;
  status?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
