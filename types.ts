
export interface Step {
  id: string;
  title: string;
  completed: boolean;
}

export interface Phase {
  id: string;
  title: string;
  steps: Step[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  phases: Phase[];
  createdAt: number;
}

export type ViewState = 'dashboard' | 'project-detail' | 'ai-wizard';
