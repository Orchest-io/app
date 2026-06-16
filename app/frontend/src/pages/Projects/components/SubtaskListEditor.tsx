
interface SubtaskListEditorProps {
  subtasks: string[];
  onChange: (subtasks: string[]) => void;
}

export default function SubtaskListEditor({
  subtasks,
  onChange,
}: SubtaskListEditorProps) {
  const handleEdit = (index: number, value: string) => {
    const updated = [...subtasks];
    updated[index] = value;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = subtasks.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...subtasks, ""]);
  };

  return (
    <div className="space-y-2">
      {subtasks.length > 0 && (
        <ul className="space-y-1.5">
          {subtasks.map((subtask, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={subtask}
                onChange={(e) => handleEdit(index, e.target.value)}
                placeholder={`Subtask ${index + 1}`}
                className="flex-1 bg-surface-container-low text-on-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-electric-blue/50 placeholder:text-on-surface-variant/50"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label="Remove subtask"
                className="w-6 h-6 flex items-center justify-center rounded-md text-on-surface-variant hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-1.5 text-xs font-semibold text-electric-blue hover:text-electric-blue/80 transition-colors py-1"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        Add subtask
      </button>
    </div>
  );
}
