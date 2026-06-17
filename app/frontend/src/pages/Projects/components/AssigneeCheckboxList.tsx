
interface SuggestedAssigneeDto {
  userId: string;
  fullName: string;
  avatarUrl: string;
}

interface AssigneeCheckboxListProps {
  assignees: SuggestedAssigneeDto[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export default function AssigneeCheckboxList({
  assignees,
  selectedIds,
  onChange,
}: AssigneeCheckboxListProps) {
  const handleToggle = (userId: string) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  };

  if (assignees.length === 0) {
    return (
      <p className="text-xs text-on-surface-variant italic py-1">
        No suggested assignees available.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {assignees.map((assignee) => {
        const isChecked = selectedIds.includes(assignee.userId);
        return (
          <li key={assignee.userId}>
            <label
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                isChecked
                  ? "bg-electric-blue/10 border-electric-blue/30"
                  : "bg-surface-container-low border-white/10 hover:bg-white/5"
              }`}
            >
              {/* Avatar */}
              {assignee.avatarUrl ? (
                <img
                  src={assignee.avatarUrl}
                  alt={assignee.fullName}
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-electric-blue/20 text-electric-blue flex items-center justify-center text-xs font-bold shrink-0 uppercase">
                  {assignee.fullName.charAt(0)}
                </div>
              )}

              {/* Name */}
              <span className="flex-1 text-sm text-on-surface truncate">
                {assignee.fullName}
              </span>

              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(assignee.userId)}
                className="w-4 h-4 accent-electric-blue rounded border-white/20 shrink-0 cursor-pointer"
              />
            </label>
          </li>
        );
      })}
    </ul>
  );
}
