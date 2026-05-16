// Shared types for GrantForge

export interface UserProfile {
  name: string;
  email?: string;
  visaStatus: string;
  major: string;
  location: string;
  gpa?: number;
  enrollmentStatus?: string;
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
}

export interface Delta {
  grantId: string;
  grantName: string;
  changeType: 'eligibility_change' | 'new_grant' | 'deadline_change' | 'requirement_change';
  previousValue?: string;
  newValue: string;
  detectedAt: string;
  severity: 'critical' | 'warning' | 'info';
}
