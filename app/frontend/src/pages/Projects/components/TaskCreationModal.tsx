import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { generateTask, GeneratedTaskDto } from "../../../api/ai.api";
import { AiInputValues } from "./AiInputForm";
import { AiPreviewValues } from "./AiPreviewForm";
import AiInputForm from "./AiInputForm";
import AiPreviewForm from "./AiPreviewForm";
import AiLoadingView from "./AiLoadingView";
import AiLimitPrompt from "./AiLimitPrompt";
import apiClient from "../../../api/client";
import type { TaskPriority } from "../types/kanban.types";

// ─── Mode discriminated union ────────────────────────────────────────────────

type ModalMode =
  | { type: "closed" }
  | { type: "manual" }
  | { type: "ai-input" }
  | { type: "ai-loading" }
  | { type: "ai-preview"; result: GeneratedTaskDto }
  | { type: "ai-error"; statusCode: number; code?: string };

// ─── Form value shapes ───────────────────────────────────────────────────────

interface ManualFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string;
  storyPoints: number | "";
  milestoneId: string;
}

// ─── Component props ─────────────────────────────────────────────────────────

interface TaskCreationModalProps {
  projectId: string;
  projectMembers: any[];
  milestones: any[];
  onTaskCreated: (task: any, assignedMember?: any, assignedMilestone?: any) => void;
  isOpen: boolean;
  targetColumnId: string;
  onClose: () => void;
}

// ─── Default AI input values ─────────────────────────────────────────────────

const DEFAULT_AI_INPUT: AiInputValues = {
  description: "",
  scope: "full-stack",
  hints: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskCreationModal({
  projectId,
  projectMembers,
  milestones,
  onTaskCreated,
  isOpen,
  targetColumnId,
  onClose,
}: TaskCreationModalProps) {
  const { t } = useTranslation();

  // ── State ──────────────────────────────────────────────────────────────────

  const [mode, setMode] = useState<ModalMode>({ type: "manual" });

  const [manualValues, setManualValues] = useState<ManualFormValues>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    assigneeId: "",
    storyPoints: "",
    milestoneId: "",
  });

  const [aiInputValues, setAiInputValues] = useState<AiInputValues>(DEFAULT_AI_INPUT);

  // Store limit info for AiLimitPrompt when 403 is received
  const aiLimitRef = useRef<{ used: number; limit: number; tier: "free" | "pro" }>({
    used: 0,
    limit: 10,
    tier: "free",
  });

  // ── Reset when modal opens ─────────────────────────────────────────────────

  React.useEffect(() => {
    if (isOpen) {
      setMode({ type: "manual" });
      setManualValues({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        assigneeId: "",
        storyPoints: "",
        milestoneId: "",
      });
      setAiInputValues(DEFAULT_AI_INPUT);
    }
  }, [isOpen]);

  // ── Manual form submit ─────────────────────────────────────────────────────

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualValues.title.trim() || !projectId) return;

    const userId = localStorage.getItem("orchest_user_id");
    if (!userId) {
      toast.error(t("kanban.userNotAuth"));
      return;
    }

    try {
      const response = await apiClient.post("/tasks", {
        projectId,
        createdBy: userId,
        title: manualValues.title.trim(),
        description: manualValues.description.trim(),
        priority: manualValues.priority,
        status: targetColumnId,
        dueDate: manualValues.dueDate || null,
        storyPoints: manualValues.storyPoints ? Number(manualValues.storyPoints) : undefined,
        milestoneId: manualValues.milestoneId || null,
      });

      const createdTask = response.data;

      if (manualValues.assigneeId) {
        try {
          await apiClient.post(`/tasks/${createdTask.id}/assignees`, {
            userId: manualValues.assigneeId,
          });
        } catch (assignError) {
          console.error("Failed to assign task:", assignError);
          toast.warning(t("kanban.assignFailed"));
        }
      }

      const assignedMember = projectMembers.find(
        (m) => m.userId === manualValues.assigneeId,
      );
      const assignedMilestone = milestones.find(
        (ms) => ms.id === manualValues.milestoneId,
      );

      toast.success(t("kanban.taskCreated"));
      onTaskCreated(createdTask, assignedMember, assignedMilestone);
      onClose();
    } catch (error: any) {
      console.error("Failed to create task:", error);
      const msg = error.response?.data?.message || error.message;
      toast.error(
        t("kanban.failedCreate") +
          ": " +
          (Array.isArray(msg) ? msg.join(", ") : msg),
      );
    }
  };

  // ── AI flow: submit → loading → preview / error ───────────────────────────

  const handleAiSubmit = async (values: AiInputValues) => {
    setAiInputValues(values);
    setMode({ type: "ai-loading" });

    try {
      const result = await generateTask({
        projectId,
        description: values.description,
        scope: values.scope,
        hints: values.hints || undefined,
      });
      setMode({ type: "ai-preview", result });
    } catch (error: any) {
      const status: number = error?.response?.status ?? 0;
      const responseData = error?.response?.data;

      if (status === 403 && responseData?.code === "AI_LIMIT_REACHED") {
        aiLimitRef.current = {
          used: responseData?.used ?? 0,
          limit: responseData?.limit ?? 10,
          tier: responseData?.tier ?? "free",
        };
        setMode({ type: "ai-error", statusCode: 403, code: "AI_LIMIT_REACHED" });
        return;
      }

      if (status === 502) {
        toast.error(
          "AI returned an unexpected response. Please refine your description and try again.",
        );
      } else if (status === 503) {
        toast.error(
          "AI service is temporarily unavailable. Please try again later.",
        );
      } else if (!error?.response) {
        toast.error(
          "Connection error. Please check your network and try again.",
        );
      } else {
        toast.error("Something went wrong. Please try again.");
      }

      setMode({ type: "ai-input" });
    }
  };

  // ── AI preview: accept & save ─────────────────────────────────────────────

  const handleAcceptAndSave = async (
    values: AiPreviewValues & { isAiSuggested: true },
  ) => {
    const userId = localStorage.getItem("orchest_user_id");
    if (!userId) {
      toast.error(t("kanban.userNotAuth"));
      return;
    }

    try {
      const response = await apiClient.post("/tasks", {
        projectId,
        createdBy: userId,
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: targetColumnId,
        dueDate: values.dueDate || null,
        storyPoints: values.storyPoints ? Number(values.storyPoints) : undefined,
        isAiSuggested: true,
        type: values.type,
        estimatedHours: values.estimatedHours !== "" ? Number(values.estimatedHours) : undefined,
      });

      const createdTask = response.data;

      // Assign each selected assignee
      for (const selectedAssigneeId of values.selectedAssigneeIds) {
        try {
          await apiClient.post(`/tasks/${createdTask.id}/assignees`, {
            userId: selectedAssigneeId,
          });
        } catch (assignError) {
          console.error("Failed to assign task:", assignError);
        }
      }

      toast.success(t("kanban.taskCreated"));
      onTaskCreated(createdTask);
      onClose();
    } catch (error: any) {
      console.error("Failed to save AI task:", error);
      const msg = error.response?.data?.message || error.message;
      toast.error(
        t("kanban.failedCreate") +
          ": " +
          (Array.isArray(msg) ? msg.join(", ") : msg),
      );
    }
  };

  // ── AI preview: start over ────────────────────────────────────────────────

  const handleStartOver = () => {
    setMode({ type: "ai-input" });
  };

  // ── Guard: don't render when closed ───────────────────────────────────────

  if (!isOpen) return null;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const modalMaxWidth = mode.type === "ai-preview" ? "max-w-lg" : "max-w-md";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-surface border border-white/10 rounded-xl ${modalMaxWidth} w-full p-6 shadow-2xl relative overflow-y-auto max-h-[80vh]`}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold text-on-surface">
            {mode.type === "ai-input" || mode.type === "ai-loading"
              ? "Create with AI"
              : mode.type === "ai-preview"
              ? "Review AI Suggestion"
              : mode.type === "ai-error" && mode.code === "AI_LIMIT_REACHED"
              ? "AI Limit Reached"
              : t("kanban.addNewTask")}
          </h3>

          {/* Toggle: manual ↔ ai-input */}
          {(mode.type === "manual" || mode.type === "ai-input") && (
            <button
              type="button"
              onClick={() =>
                setMode(
                  mode.type === "manual"
                    ? { type: "ai-input" }
                    : { type: "manual" },
                )
              }
              className="flex items-center gap-1.5 text-xs font-semibold text-electric-blue hover:text-electric-blue/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">
                {mode.type === "manual" ? "auto_awesome" : "edit_note"}
              </span>
              {mode.type === "manual" ? "Create with AI" : "Back to manual"}
            </button>
          )}
        </div>

        {/* ── Manual Form ── */}
        {mode.type === "manual" && (
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                {t("kanban.taskTitleLabel")}
              </label>
              <input
                type="text"
                required
                placeholder={t("kanban.taskTitlePlaceholder") || "Task title..."}
                value={manualValues.title}
                onChange={(e) =>
                  setManualValues({ ...manualValues, title: e.target.value })
                }
                className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                {t("kanban.taskDescLabel")}
              </label>
              <textarea
                placeholder={t("kanban.taskDescPlaceholder") || "Task description..."}
                value={manualValues.description}
                onChange={(e) =>
                  setManualValues({ ...manualValues, description: e.target.value })
                }
                rows={3}
                className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  {t("kanban.taskPriorityLabel")}
                </label>
                <select
                  value={manualValues.priority}
                  onChange={(e) =>
                    setManualValues({
                      ...manualValues,
                      priority: e.target.value as TaskPriority,
                    })
                  }
                  className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
                >
                  <option value="low">{t("projects.priorityLow")}</option>
                  <option value="medium">{t("projects.priorityMedium")}</option>
                  <option value="high">{t("projects.priorityHigh")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  {t("kanban.taskDueDateLabel")}
                </label>
                <input
                  type="date"
                  value={manualValues.dueDate}
                  onChange={(e) =>
                    setManualValues({ ...manualValues, dueDate: e.target.value })
                  }
                  className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  {t("kanban.taskStoryPointsLabel")}
                </label>
                <select
                  value={manualValues.storyPoints}
                  onChange={(e) =>
                    setManualValues({
                      ...manualValues,
                      storyPoints: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                  className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
                >
                  <option value="">{t("kanban.noneOption")}</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="5">5</option>
                  <option value="8">8</option>
                  <option value="13">13</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                {t("kanban.assignToLabel")}
              </label>
              <select
                value={manualValues.assigneeId}
                onChange={(e) =>
                  setManualValues({ ...manualValues, assigneeId: e.target.value })
                }
                className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
              >
                <option value="">{t("kanban.unassignedOption")}</option>
                {projectMembers.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user?.fullName || "Unknown"} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            {milestones.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  {t("kanban.milestoneLabel")}{" "}
                  <span className="ml-1 font-normal normal-case text-on-surface-variant/60">
                    {t("kanban.optionalText")}
                  </span>
                </label>
                <select
                  value={manualValues.milestoneId}
                  onChange={(e) =>
                    setManualValues({ ...manualValues, milestoneId: e.target.value })
                  }
                  className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
                >
                  <option value="">{t("kanban.noMilestoneBacklog")}</option>
                  {milestones.map((ms) => (
                    <option key={ms.id} value={ms.id}>
                      {ms.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-on-surface text-xs font-semibold px-4 py-2.5 rounded-lg transition-all"
              >
                {t("kanban.cancelBtn")}
              </button>
              <button
                type="submit"
                className="bg-electric-blue text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all"
              >
                {t("kanban.createTaskBtn")}
              </button>
            </div>
          </form>
        )}

        {/* ── AI Input Form ── */}
        {mode.type === "ai-input" && (
          <AiInputForm
            onSubmit={handleAiSubmit}
            onBack={() => setMode({ type: "manual" })}
            isLoading={false}
            initialValues={aiInputValues}
          />
        )}

        {/* ── AI Loading ── */}
        {mode.type === "ai-loading" && <AiLoadingView />}

        {/* ── AI Preview ── */}
        {mode.type === "ai-preview" && (
          <AiPreviewForm
            result={mode.result}
            onAccept={handleAcceptAndSave}
            onStartOver={handleStartOver}
          />
        )}

        {/* ── AI Limit Reached ── */}
        {mode.type === "ai-error" && mode.code === "AI_LIMIT_REACHED" && (
          <div className="space-y-4">
            <AiLimitPrompt
              used={aiLimitRef.current.used}
              limit={aiLimitRef.current.limit}
              tier={aiLimitRef.current.tier}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode({ type: "ai-input" })}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-on-surface text-xs font-semibold px-4 py-2.5 rounded-lg transition-all"
              >
                {t("kanban.cancelBtn")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
