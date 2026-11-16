export const REMEDIATION_STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'patched', label: 'Patched' },
];

export function statusLabel(value) {
  return REMEDIATION_STATUSES.find((s) => s.value === value)?.label ?? value;
}
