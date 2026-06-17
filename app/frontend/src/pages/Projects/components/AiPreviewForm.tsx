import { useState } from "react";
import type { GeneratedTaskDto } from "../../../api/ai.api";
import SubtaskListEditor from "./SubtaskListEditor";
import AssigneeCheckboxList from "./AssigneeCheckboxList";

export interface AiPreviewValues {
  title: string;
  description: string;
  type: "feature" | "bug" | "improvement";
  priority: "low" | "medium" | "high" | "urgent";
  estimatedHours: number | "";
  storyPoints: number | "";
  dueDate: string;
  subtasks: string[];
  selectedAssigneeIds: string[];
}

interface AiPreviewFormProps {
  result: GeneratedTaskDto;
  onAccept: (values: AiPreviewValues & { isAiSuggested: true }) => void;
  onStartOver: () => void;
}

export default function AiPreviewForm({
  result,
  onAccept,
  onStartOver,
}: AiPreviewFormProps) {
  const [values, setValues] = useState<AiPreviewValues>({
    title: result.title,
    description: result.description,
    type: result.type,
    priority: result.priority,
    estimatedHours: result.estimatedHours,
    storyPoints: result.storyPoints,
    dueDate: result.dueDate ?? "",
    subtasks: result.subtasks,
    selectedAssigneeIds: result.suggestedAssignees.map((a) => a.userId),
  });

  const labelClass =
    "block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5";
  const inputClass =
    "w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm";

  const handleAccept = () => {
    onAccept({ ...values, isAiSuggested: true });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          className={inputClass}
          placeholder="Task title..."
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="Task description..."
        />
      </div>

      {/* Type & Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Type</label>
          <select
            value={values.type}
            onChange={(e) =>
              setValues({
                ...values,
                type: e.target.value as AiPreviewValues["type"],
              })
            }
            className={inputClass}
          >
            <option value="feature">Feature</option>
            <option value="bug">Bug</option>
            <option value="improvement">Improvement</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Priority</label>
          <select
            value={values.priority}
            onChange={(e) =>
              setValues({
                ...values,
                priority: e.target.value as AiPreviewValues["priority"],
              })
            }
            className={inputClass}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Estimated Hours & Story Points */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Estimated Hours</label>
          <input
            type="number"
            min={0}
            value={values.estimatedHours}
            onChange={(e) =>
              setValues({
                ...values,
                estimatedHours: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            className={inputClass}
            placeholder="e.g. 8"
          />
        </div>

        <div>
          <label className={labelClass}>Story Points</label>
          <select
            value={values.storyPoints}
            onChange={(e) =>
              setValues({
                ...values,
                storyPoints: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            className={inputClass}
          >
            <option value="">None</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="8">8</option>
            <option value="13">13</option>
          </select>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label className={labelClass}>Due Date</label>
        <input
          type="date"
          value={values.dueDate}
          onChange={(e) => setValues({ ...values, dueDate: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* Subtasks */}
      <div>
        <label className={labelClass}>Subtasks</label>
        <SubtaskListEditor
          subtasks={values.subtasks}
          onChange={(subtasks) => setValues({ ...values, subtasks })}
        />
      </div>

      {/* Suggested Assignees */}
      <div>
        <label className={labelClass}>Suggested Assignees</label>
        <AssigneeCheckboxList
          assignees={result.suggestedAssignees}
          selectedIds={values.selectedAssigneeIds}
          onChange={(selectedAssigneeIds) =>
            setValues({ ...values, selectedAssigneeIds })
          }
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onStartOver}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-on-surface text-xs font-semibold px-4 py-2.5 rounded-lg transition-all"
        >
          Start Over
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="bg-electric-blue text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all"
        >
          Accept &amp; Save
        </button>
      </div>
    </div>
  );
}
