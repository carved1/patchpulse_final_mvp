import { TEAM_MEMBERS } from '../utils/demoUsers';
import { REMEDIATION_STATUSES } from '../utils/remediation';

export default function RemediationControls({ item, onChange, canAssign = false }) {
  const idPrefix = `remediation-${item.cveId}`;

  return (
    <div className="remediation">
      <div className="field field--inline">
        <label htmlFor={`${idPrefix}-status`}>Status</label>
        <select
          id={`${idPrefix}-status`}
          value={item.status}
          onChange={(event) => onChange({ status: event.target.value })}
        >
          {REMEDIATION_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {canAssign && (
        <div className="field field--inline">
          <label htmlFor={`${idPrefix}-assignee`}>Assignee</label>
          <select
            id={`${idPrefix}-assignee`}
            value={item.assignee}
            onChange={(event) => onChange({ assignee: event.target.value })}
          >
            <option value="">Unassigned</option>
            {TEAM_MEMBERS.map((member) => (
              <option key={member.id} value={member.name}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="field field--inline">
        <label htmlFor={`${idPrefix}-due`}>Due</label>
        <input
          id={`${idPrefix}-due`}
          type="date"
          value={item.dueDate}
          onChange={(event) => onChange({ dueDate: event.target.value })}
        />
      </div>
    </div>
  );
}
