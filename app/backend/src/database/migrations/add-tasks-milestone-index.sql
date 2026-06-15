-- Index for finding tasks without milestones (orphaned tasks)
-- Useful for validation and cleanup operations

CREATE INDEX IF NOT EXISTS idx_tasks_no_milestone 
ON tasks(project_id) 
WHERE milestone_id IS NULL;
