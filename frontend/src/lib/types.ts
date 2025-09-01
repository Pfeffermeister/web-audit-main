// Type definitions for the audit system

export interface A11yCriterion {
  id: string;
  title: string;
  description?: string;
  status: 'pass' | 'fail' | 'untested' | 'inapplicable' | 'incomplete';
  wcag: string[];
  advice: string;
  link?: string;
  linkText?: string;
  checked: Array<{
    selector: string;
    text: string;
    src?: string;
  }>;
}

export interface A11yCategory {
  id: string;
  label: string;
  criteria: A11yCriterion[];
}

export interface GroupRecord {
  groupId: string;
  url: string;
  selected: {
    wcag: boolean;
    seo: boolean;
    statement: boolean;
  };
  jobs: JobRecord[];
  createdAt: number;
}

export interface JobRecord {
  kind: 'wcag' | 'seo' | 'statement';
  status: 'pending' | 'running' | 'done' | 'error';
  startedAt?: number;
  finishedAt?: number;
  error?: string;
  wcag?: any;
  seo?: any;
  statement?: any;
}
