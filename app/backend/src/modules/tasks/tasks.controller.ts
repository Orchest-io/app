import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Request,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import {
	CreateTaskDto,
	UpdateTaskDto,
	BulkUpdateTasksDto,
	CreateSubtaskDto,
	UpdateSubtaskDto,
	AddTaskAssigneeDto,
	CreateTaskDependencyDto,
	CreateCommentDto,
} from "@orchest/shared";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import {
	CurrentUser,
	JwtPayload,
} from "../../common/decorators/current-user.decorator";

@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  // Board operations must come before parametric tasks endpoints to avoid route matching issues
  @Get('board/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.tasksService.findByProject(projectId);
  }

  @Patch('board/bulk-update')
  bulkUpdateStatus(@Body() bulkUpdateTasksDto: BulkUpdateTasksDto) {
    return this.tasksService.bulkUpdateStatus(bulkUpdateTasksDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Post(':taskId/subtasks')
  createSubtask(@Param('taskId') taskId: string, @Body() createSubtaskDto: CreateSubtaskDto) {
    return this.tasksService.createSubtask(taskId, createSubtaskDto);
  }

  @Patch('subtasks/:subtaskId')
  updateSubtask(@Param('subtaskId') subtaskId: string, @Body() updateSubtaskDto: UpdateSubtaskDto) {
    return this.tasksService.updateSubtask(subtaskId, updateSubtaskDto);
  }

  @Delete('subtasks/:subtaskId')
  deleteSubtask(@Param('subtaskId') subtaskId: string) {
    return this.tasksService.deleteSubtask(subtaskId);
  }

  @Post(':taskId/assignees')
  addAssignee(@Param('taskId') taskId: string, @Body() addTaskAssigneeDto: AddTaskAssigneeDto) {
    return this.tasksService.addAssignee(taskId, addTaskAssigneeDto);
  }

  @Delete(':taskId/assignees/:userId')
  removeAssignee(@Param('taskId') taskId: string, @Param('userId') userId: string) {
    return this.tasksService.removeAssignee(taskId, userId);
  }

  @Post(':taskId/dependencies')
  addDependency(@Param('taskId') taskId: string, @Body() createTaskDependencyDto: CreateTaskDependencyDto) {
    return this.tasksService.addDependency(taskId, createTaskDependencyDto);
  }

  @Delete('dependencies/:dependencyId')
  removeDependency(@Param('dependencyId') dependencyId: string) {
    return this.tasksService.removeDependency(dependencyId);
  }

  @Post(":taskId/comments")
  createComment(
    @Request() req: any,
    @Param("taskId") taskId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = req.user?.id || req.user?.userId || "00000000-0000-0000-0000-000000000000";
    return this.tasksService.createComment(taskId, userId, createCommentDto);
  }

  @Get(":taskId/comments")
  getCommentsByTask(@Param("taskId") taskId: string) {
    return this.tasksService.getCommentsByTask(taskId);
  }
}
