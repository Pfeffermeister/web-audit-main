import { GroupRecord, JobRecord } from "./types";
import { API_ENDPOINTS, API_BASE_URL, API_TIMEOUT } from "../config";

const LS_KEY = "audit-groups";

// LocalStorage functions mit Error-Handling für Quota-Probleme
function loadAll(): GroupRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return [];
  }
}

function saveAll(list: GroupRecord[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded, cleaning up old entries...');

      // Bereinige alte Einträge (älter als 24 Stunden)
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      const cleanedList = list.filter(group => group.createdAt > oneDayAgo);

      // Wenn das nicht reicht, behalte nur die neuesten 5 Einträge
      if (cleanedList.length > 5) {
        cleanedList.sort((a, b) => b.createdAt - a.createdAt);
        cleanedList.splice(5);
      }

      try {
        localStorage.clear(); // Komplett leeren
        localStorage.setItem(LS_KEY, JSON.stringify(cleanedList));
        console.log(`LocalStorage cleaned, kept ${cleanedList.length} recent entries`);
      } catch (retryError) {
        console.error('Failed to save even after cleanup:', retryError);
        // Als letzter Ausweg: Nur die aktuelle Gruppe speichern
        const currentGroup = list[list.length - 1];
        if (currentGroup) {
          try {
            localStorage.clear();
            localStorage.setItem(LS_KEY, JSON.stringify([currentGroup]));
          } catch (finalError) {
            console.error('Complete localStorage failure:', finalError);
          }
        }
      }
    } else {
      console.error('Failed to save to localStorage:', error);
    }
  }
}

// Helper functions
export function getAllGroups(): GroupRecord[] {
  return loadAll();
}

export function getGroup(groupId: string): GroupRecord | null {
  const all = loadAll();
  return all.find(g => g.groupId === groupId) || null;
}

export function updateGroup(updated: GroupRecord) {
  const all = loadAll();
  const index = all.findIndex(g => g.groupId === updated.groupId);
  if (index >= 0) {
    all[index] = updated;
    saveAll(all);
  }
}

export function createGroup(url: string, selected: { wcag: boolean; seo: boolean; statement: boolean }): GroupRecord {
  const groupId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const group: GroupRecord = {
    groupId,
    url: url.startsWith('http') ? url : `https://${url}`,
    selected,
    jobs: [],
    createdAt: Date.now()
  };

  const all = loadAll();
  all.push(group);
  saveAll(all);
  return group;
}

export function allSelectedDone(group: GroupRecord): boolean {
  const selectedWorkflows = getSelectedWorkflows(group);
  const completedJobs = group.jobs.filter(j => j.status === 'done' || j.status === 'error');
  return completedJobs.length >= selectedWorkflows.length;
}

export function allSelectedSuccessful(group: GroupRecord): boolean {
  const selectedWorkflows = getSelectedWorkflows(group);
  const successfulJobs = group.jobs.filter(j => j.status === 'done');
  return successfulJobs.length >= selectedWorkflows.length;
}

export function getSelectedWorkflows(group: GroupRecord): string[] {
  const selected = [];
  if (group.selected.wcag) selected.push('wcag');
  if (group.selected.seo) selected.push('seo');
  if (group.selected.statement) selected.push('statement');
  return selected;
}

export async function startSelectedWorkflows(group: GroupRecord): Promise<void> {
  const workflows = getSelectedWorkflows(group);

  for (const workflow of workflows) {
    // Create job record
    const job: JobRecord = {
      kind: workflow as 'wcag' | 'seo' | 'statement',
      status: 'running',
      startedAt: Date.now()
    };

    group.jobs.push(job);
    updateGroup(group);

    try {
      // Use backend API instead of direct n8n calls
      const endpoint = API_ENDPOINTS[workflow as keyof typeof API_ENDPOINTS];
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: group.url }),
        signal: AbortSignal.timeout(API_TIMEOUT)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();

      // Komprimiere große WCAG-Daten um LocalStorage zu schonen
      if (workflow === 'wcag' && result?.criteria) {
        result.criteria = result.criteria.map((criterion: any) => ({
          ...criterion,
          // Begrenzte HTML-Snippets (max 200 Zeichen)
          rules: criterion.rules?.map((rule: any) => ({
            ...rule,
            nodes: rule.nodes?.map((node: any) => ({
              ...node,
              html: node.html ? node.html.substring(0, 200) + (node.html.length > 200 ? '...' : '') : node.html
            }))
          }))
        }));
      }

      // Update job with results
      job.status = 'done';
      job.finishedAt = Date.now();
      job[workflow as 'wcag' | 'seo' | 'statement'] = result;

    } catch (error) {
      console.error(`Error starting ${workflow} workflow:`, error);

      // Spezielle Behandlung für Quota-Fehler
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        job.status = 'error';
        job.error = 'Speicher voll - bitte Browser-Cache leeren und erneut versuchen';
      } else {
        job.status = 'error';
        job.error = error instanceof Error ? error.message : 'Unknown error';
      }

      job.finishedAt = Date.now();
    }

    updateGroup(group);
  }
}
