import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type {
	Task,
	Column,
	BoardState,
	FilterState,
} from "./types/kanban.types";
import TaskFilters from "./components/TaskFilters";
import KanbanColumn from "./components/KanbanColumn";
import TaskCreationModal from "./components/TaskCreationModal";
import apiClient from "../../api/client";
import { getMilestones } from "../../api/projects.api";

// Column definitions (fixed structure)
const COLUMNS: Record<string, Column> = {
	backlog: { id: "backlog", title: "Backlog", taskIds: [] },
	todo: { id: "todo", title: "To Do", taskIds: [] },
	"in-progress": { id: "in-progress", title: "In Progress", taskIds: [] },
	review: { id: "review", title: "Review", taskIds: [] },
	done: { id: "done", title: "Done", taskIds: [] },
};

const COLUMN_ORDER = ["backlog", "todo", "in-progress", "review", "done"];

// Default milestone colors palette
const MILESTONE_COLORS = [
	"#6366f1",
	"#8b5cf6",
	"#ec4899",
	"#f59e0b",
	"#10b981",
	"#3b82f6",
	"#ef4444",
	"#14b8a6",
];

interface Milestone {
	id: string;
	title: string;
	status: string;
	color: string | null;
	progress: number;
	taskCount: number;
	doneCount: number;
	targetDate?: string;
}

export default function KanbanPage() {
	const { projectId } = useParams<{ projectId: string }>();
	const navigate = useNavigate();
	const { t } = useTranslation();

	// State Management
	const [board, setBoard] = useState<BoardState>({
		tasks: {},
		columns: COLUMNS,
		columnOrder: COLUMN_ORDER,
	});

	const [loading, setLoading] = useState(true);
	const [projectMembers, setProjectMembers] = useState<any[]>([]);
	const [milestones, setMilestones] = useState<Milestone[]>([]);
	const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
		null,
	); // null = All

	const [filters, setFilters] = useState<FilterState>({
		searchQuery: "",
		priority: "all",
		assigneeId: null,
	});

	// Add Task Modal State
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [targetColumnId, setTargetColumnId] = useState("");

	// Raw tasks from API (for milestone filtering)
	const [rawTasks, setRawTasks] = useState<any[]>([]);

	const buildBoardFromTasks = useCallback((tasksFromAPI: any[]) => {
		const tasksMap: Record<string, Task> = {};
		const columnsMap: Record<string, any> = {};

		COLUMN_ORDER.forEach((colId) => {
			const typedColId = colId as keyof typeof COLUMNS;
			columnsMap[colId] = {
				id: colId,
				title: COLUMNS[typedColId].title,
				taskIds: [],
			};
		});

		tasksFromAPI.forEach((apiTask: any) => {
			const task: Task = {
				id: apiTask.id,
				projectId: apiTask.projectId,
				title: apiTask.title,
				description: apiTask.description || "",
				priority: apiTask.priority || "medium",
				assignees:
					apiTask.assignees?.map((a: any) => ({
						id: a.userId,
						name: a.user?.fullName || "Unknown",
						avatarUrl: a.user?.avatarUrl || "",
					})) || [],
				subtasks:
					apiTask.subtasks?.map((s: any) => ({
						id: s.id,
						title: s.title,
						completed: s.isCompleted,
					})) || [],
				dueDate: apiTask.dueDate,
				columnId: apiTask.status || "backlog",
				milestoneId: apiTask.milestoneId || null,
				milestone: apiTask.milestone || null,
				storyPoints: apiTask.storyPoints,
			};

			tasksMap[task.id] = task;

			const colId = task.columnId;
			if (columnsMap[colId]) {
				columnsMap[colId].taskIds.push(task.id);
			}
		});

		setBoard({
			tasks: tasksMap,
			columns: columnsMap,
			columnOrder: COLUMN_ORDER,
		});
	}, []);

	const fetchMilestones = useCallback(async () => {
		if (!projectId) return;
		try {
			const data = await getMilestones(projectId);
			setMilestones(data);
		} catch (error) {
			console.error("Failed to fetch milestones:", error);
		}
	}, [projectId]);

	// Fetch tasks from backend
	useEffect(() => {
		if (!projectId) return;

		const fetchTasks = async () => {
			try {
				setLoading(true);
				const response = await apiClient.get(`/tasks/board/${projectId}`);
				const tasksFromAPI = response.data;
				setRawTasks(tasksFromAPI);
				buildBoardFromTasks(tasksFromAPI);
			} catch (error: any) {
				console.error("Failed to fetch tasks:", error);
				if (error?.response?.status === 401) {
					toast.error(t("kanban.authRequired"));
					navigate("/login");
				} else {
					toast.error(t("kanban.failedLoad"));
				}
			} finally {
				setLoading(false);
			}
		};

		const fetchProjectMembers = async () => {
			try {
				const response = await apiClient.get(`/projects/${projectId}`);
				setProjectMembers(response.data.members || []);
			} catch (error) {
				console.error("Failed to fetch project members:", error);
			}
		};

		fetchTasks();
		fetchProjectMembers();
		fetchMilestones();
	}, [projectId, navigate, buildBoardFromTasks, fetchMilestones, t]);

	// Re-filter board when milestone selection changes
	useEffect(() => {
		if (rawTasks.length === 0) return;
		let filtered = rawTasks;
		if (selectedMilestoneId === "__none__") {
			filtered = rawTasks.filter((t) => !t.milestoneId);
		} else if (selectedMilestoneId) {
			filtered = rawTasks.filter((t) => t.milestoneId === selectedMilestoneId);
		}
		buildBoardFromTasks(filtered);
	}, [selectedMilestoneId, rawTasks, buildBoardFromTasks]);

	// Handle Drag & Drop Callback
	const handleDragEnd = async (result: DropResult) => {
		const { destination, source, draggableId } = result;

		if (!destination) return;
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		)
			return;

		const sourceCol = board.columns[source.droppableId];
		const destCol = board.columns[destination.droppableId];

		const newColumns = { ...board.columns };
		const newSourceTaskIds = [...sourceCol.taskIds];
		const taskIndexInSource = newSourceTaskIds.indexOf(draggableId);

		if (taskIndexInSource !== -1) {
			newSourceTaskIds.splice(taskIndexInSource, 1);
		}

		const newDestTaskIds =
			source.droppableId === destination.droppableId
				? newSourceTaskIds
				: [...destCol.taskIds];

		newDestTaskIds.splice(destination.index, 0, draggableId);

		newColumns[source.droppableId] = {
			...sourceCol,
			taskIds: newSourceTaskIds,
		};
		newColumns[destination.droppableId] = {
			...destCol,
			taskIds: newDestTaskIds,
		};

		const updatedTask = {
			...board.tasks[draggableId],
			columnId: destination.droppableId,
		};

		setBoard({
			...board,
			tasks: { ...board.tasks, [draggableId]: updatedTask },
			columns: newColumns,
		});

		try {
			await apiClient.patch(`/tasks/${draggableId}`, {
				status: destination.droppableId,
			});
			toast.success(t("kanban.taskMoved"));
		} catch (error) {
			console.error("Failed to update task:", error);
			toast.error(t("kanban.failedMove"));
			setBoard(board);
		}
	};

	// Trigger Add Task Dialog
	const handleOpenAddTask = (columnId: string) => {
		setTargetColumnId(columnId);
		setIsAddModalOpen(true);
	};

	// Filter Tasks Map
	const filteredTasksByColumn: Record<string, Task[]> = {};
	board.columnOrder.forEach((colId) => {
		const colTaskIds = board.columns[colId]?.taskIds || [];
		filteredTasksByColumn[colId] = colTaskIds
			.map((tid) => board.tasks[tid])
			.filter((task) => {
				if (!task) return false;
				const matchesSearch = task.title
					.toLowerCase()
					.includes(filters.searchQuery.toLowerCase());
				const matchesPriority =
					filters.priority === "all" || task.priority === filters.priority;
				const matchesAssignee =
					filters.assigneeId === null ||
					task.assignees.some((a) => a.id === filters.assigneeId);
				return matchesSearch && matchesPriority && matchesAssignee;
			});
	});

	const getMilestoneColor = (ms: Milestone, idx: number) =>
		ms.color || MILESTONE_COLORS[idx % MILESTONE_COLORS.length];

	if (loading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-100px)]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
					<p className="text-on-surface-variant">{t("kanban.loadingTasks")}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-[calc(100vh-100px)]">
			{/* Board Navigation Header */}
			<div className="flex justify-between items-center mb-4">
				<div>
					<button
						onClick={() => navigate(`/projects/${projectId || ""}`)}
						className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface mb-2 transition-colors cursor-pointer"
					>
						<span className="material-symbols-outlined text-[14px]">
							arrow_back
						</span>
						{t("kanban.backToDetails")}
					</button>
					<h2 className="font-heading text-2xl font-semibold text-on-surface">
						{t("kanban.boardTitle")}
					</h2>
				</div>
			</div>

			{/* Milestone Filter Bar */}
			{milestones.length > 0 && (
				<div className="mb-4">
					<div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
						<span className="text-xs text-on-surface-variant font-medium shrink-0 mr-1">
							{t("kanban.filterByMilestone")}
						</span>

						{/* All Tasks chip */}
						<button
							onClick={() => setSelectedMilestoneId(null)}
							className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
								selectedMilestoneId === null
									? "bg-electric-blue text-white border-electric-blue shadow-sm"
									: "bg-white/5 text-on-surface-variant border-white/10 hover:bg-white/10"
							}`}
						>
							<span className="material-symbols-outlined text-[13px]">
								table_rows
							</span>
							{t("kanban.allTasks")}
						</button>

						{/* No Milestone chip */}
						<button
							onClick={() => setSelectedMilestoneId("__none__")}
							className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
								selectedMilestoneId === "__none__"
									? "bg-white/20 text-on-surface border-white/30 shadow-sm"
									: "bg-white/5 text-on-surface-variant border-white/10 hover:bg-white/10"
							}`}
						>
							<span className="material-symbols-outlined text-[13px]">
								inbox
							</span>
							{t("kanban.noMilestone")}
						</button>

						{/* Milestone chips */}
						{milestones.map((ms, idx) => {
							const color = getMilestoneColor(ms, idx);
							const isActive = selectedMilestoneId === ms.id;
							return (
								<button
									key={ms.id}
									onClick={() => setSelectedMilestoneId(ms.id)}
									className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
										isActive
											? "text-white shadow-md"
											: "text-on-surface-variant bg-white/5 border-white/10 hover:bg-white/10"
									}`}
									style={
										isActive
											? { backgroundColor: color, borderColor: color }
											: { borderColor: `${color}40` }
									}
								>
									<span
										className="w-2 h-2 rounded-full shrink-0"
										style={{ backgroundColor: color }}
									/>
									{ms.title}
									{ms.taskCount > 0 && (
										<span
											className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
											style={
												isActive
													? {
															backgroundColor: "rgba(255,255,255,0.25)",
															color: "white",
														}
													: { backgroundColor: `${color}20`, color }
											}
										>
											{ms.doneCount}/{ms.taskCount}
										</span>
									)}
								</button>
							);
						})}
					</div>

					{/* Active milestone progress */}
					{selectedMilestoneId &&
						selectedMilestoneId !== "__none__" &&
						(() => {
							const active = milestones.find(
								(ms) => ms.id === selectedMilestoneId,
							);
							if (!active) return null;
							const color = getMilestoneColor(
								active,
								milestones.indexOf(active),
							);
							return (
								<div className="mt-2 flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
									<span
										className="material-symbols-outlined text-[16px]"
										style={{ color }}
									>
										flag
									</span>
									<div className="flex-1">
										<div className="flex items-center justify-between mb-1">
											<span className="text-xs font-semibold text-on-surface">
												{active.title}
											</span>
											<span className="text-xs text-on-surface-variant">
												{active.progress}%
											</span>
										</div>
										<div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
											<div
												className="h-full rounded-full transition-all duration-500"
												style={{
													width: `${active.progress}%`,
													backgroundColor: color,
												}}
											/>
										</div>
									</div>
									{active.targetDate && (
										<span className="text-xs text-on-surface-variant">
											{t("kanban.dueText")}{" "}
											{new Date(active.targetDate).toLocaleDateString()}
										</span>
									)}
								</div>
							);
						})()}
				</div>
			)}

			{/* Filter Toolbar & Analytics */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<TaskFilters filters={filters} onFiltersChange={setFilters} projectMembers={projectMembers} />

				<button
					onClick={() => navigate(`/projects/${projectId}/analytics`)}
					className="flex items-center gap-2 px-4 py-2 rounded-xl bg-electric-blue/10 text-electric-blue border border-electric-blue/20 hover:bg-electric-blue hover:text-white transition-all font-semibold text-sm shadow-sm"
				>
					<span className="material-symbols-outlined text-[18px]">
						insights
					</span>
					{t("kanban.projectAnalytics")}
				</button>
			</div>

			{/* Kanban Board Area */}
			<div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
				<DragDropContext onDragEnd={handleDragEnd}>
					<div className="flex gap-6 h-full min-w-max">
						{board.columnOrder.map((colId) => {
							const column = board.columns[colId];
							const tasksInCol = filteredTasksByColumn[colId] || [];
							return (
								<KanbanColumn
									key={column.id}
									column={column}
									tasks={tasksInCol}
									onCardClick={(task) =>
										navigate(`/projects/${projectId}/tasks/${task.id}`)
									}
									onAddTask={handleOpenAddTask}
									milestones={milestones}
									milestoneColors={MILESTONE_COLORS}
								/>
							);
						})}
					</div>
				</DragDropContext>
			</div>

			{/* Add Task Modal */}
			<TaskCreationModal
				projectId={projectId!}
				projectMembers={projectMembers}
				milestones={milestones}
				isOpen={isAddModalOpen}
				targetColumnId={targetColumnId}
				onTaskCreated={(createdTask, assignedMember, assignedMilestone) => {
					const newTask: Task = {
						id: createdTask.id,
						projectId: createdTask.projectId,
						title: createdTask.title,
						description: createdTask.description || "",
						priority: createdTask.priority || "medium",
						assignees: assignedMember
							? [
									{
										id: assignedMember.userId,
										name: assignedMember.user?.fullName || "Unknown",
										avatarUrl: assignedMember.user?.avatarUrl || "",
									},
								]
							: [],
						subtasks: [],
						dueDate: createdTask.dueDate,
						columnId: targetColumnId,
						storyPoints: createdTask.storyPoints,
						milestoneId: createdTask.milestoneId || null,
						milestone: assignedMilestone
							? {
									id: assignedMilestone.id,
									title: assignedMilestone.title,
									color: assignedMilestone.color,
									status: assignedMilestone.status,
								}
							: createdTask.milestone || null,
					};

					setBoard((prev) => ({
						...prev,
						tasks: { ...prev.tasks, [newTask.id]: newTask },
						columns: {
							...prev.columns,
							[targetColumnId]: {
								...prev.columns[targetColumnId],
								taskIds: [...prev.columns[targetColumnId].taskIds, newTask.id],
							},
						},
					}));

					const createdTaskWithRelation = {
						...createdTask,
						milestone: assignedMilestone
							? {
									id: assignedMilestone.id,
									title: assignedMilestone.title,
									color: assignedMilestone.color,
									status: assignedMilestone.status,
								}
							: createdTask.milestone || null,
					};
					setRawTasks((prev) => [...prev, createdTaskWithRelation]);
					fetchMilestones();
				}}
				onClose={() => setIsAddModalOpen(false)}
			/>
		</div>
	);
}
