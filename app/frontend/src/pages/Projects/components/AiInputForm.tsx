import React, { useState } from "react";

export interface AiInputValues {
  description: string;
  scope: "frontend-only" | "backend-only" | "full-stack";
  hints: string;
}

interface AiInputFormProps {
  onSubmit: (values: AiInputValues) => void;
  onBack: () => void;
  isLoading: boolean;
  initialValues?: AiInputValues;
}

const DEFAULT_VALUES: AiInputValues = {
  description: "",
  scope: "full-stack",
  hints: "",
};

export default function AiInputForm({
  onSubmit,
  onBack,
  isLoading,
  initialValues,
}: AiInputFormProps) {
  const [values, setValues] = useState<AiInputValues>(
    initialValues ?? DEFAULT_VALUES,
  );
  const [descriptionError, setDescriptionError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate description
    if (!values.description.trim()) {
      setDescriptionError("Description is required.");
      return;
    }
    if (values.description.length > 2000) {
      setDescriptionError("Description must be 2000 characters or fewer.");
      return;
    }

    setDescriptionError("");
    onSubmit(values);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const val = e.target.value;
    setValues((prev) => ({ ...prev, description: val }));
    // Clear error on change once valid
    if (val.trim() && val.length <= 2000) {
      setDescriptionError("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
          Description
          <span className="ml-1 font-normal normal-case text-on-surface-variant/60">
            (required)
          </span>
        </label>
        <textarea
          value={values.description}
          onChange={handleDescriptionChange}
          maxLength={2000}
          rows={5}
          placeholder="Describe the task you want to generate…"
          className={`w-full bg-surface-container-low text-on-surface border rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm resize-none transition-colors ${
            descriptionError ? "border-red-400/60" : "border-white/10"
          }`}
        />
        <div className="flex items-center justify-between mt-1">
          {descriptionError ? (
            <span className="text-red-400 text-xs">{descriptionError}</span>
          ) : (
            <span />
          )}
          <span
            className={`text-xs ml-auto ${
              values.description.length > 2000
                ? "text-red-400"
                : "text-on-surface-variant/60"
            }`}
          >
            {values.description.length}/2000
          </span>
        </div>
      </div>

      {/* Scope */}
      <div>
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
          Scope
        </label>
        <select
          value={values.scope}
          onChange={(e) =>
            setValues((prev) => ({
              ...prev,
              scope: e.target.value as AiInputValues["scope"],
            }))
          }
          className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
        >
          <option value="frontend-only">frontend-only</option>
          <option value="backend-only">backend-only</option>
          <option value="full-stack">full-stack</option>
        </select>
      </div>

      {/* Hints */}
      <div>
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
          Hints
          <span className="ml-1 font-normal normal-case text-on-surface-variant/60">
            (optional)
          </span>
        </label>
        <textarea
          value={values.hints}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, hints: e.target.value }))
          }
          maxLength={500}
          rows={3}
          placeholder="Any extra context or constraints for the AI…"
          className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm resize-none"
        />
        <div className="flex justify-end mt-1">
          <span
            className={`text-xs ${
              values.hints.length > 500
                ? "text-red-400"
                : "text-on-surface-variant/60"
            }`}
          >
            {values.hints.length}/500
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-on-surface text-xs font-semibold px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back to manual
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-electric-blue text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isLoading && (
            <span className="material-symbols-outlined text-[14px] animate-spin">
              progress_activity
            </span>
          )}
          Generate Task
        </button>
      </div>
    </form>
  );
}
