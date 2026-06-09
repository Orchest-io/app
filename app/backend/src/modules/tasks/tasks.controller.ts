import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from '@orchest/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
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
<<<<<<< Updated upstream
=======

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
>>>>>>> Stashed changes
}
