erDiagram
    %% ==========================================
    %% DOMAIN 1: USERS & AUTH
    %% ==========================================
    users ||--o{ user_sessions : "has"
    users ||--|| user_settings : "configures"
    users ||--o{ user_skills : "possesses"
    users ||--o{ project_members : "participates in"
    users ||--o{ task_assignees : "assigned to"
    users ||--o{ comments : "writes"
    users ||--o{ notifications : "receives"
    users ||--o{ activity_logs : "generates"
    users ||--o{ time_entries : "logs"
    users ||--o{ ai_conversations : "initiates"
    users ||--o{ attachments : "uploads"
    users ||--o{ reports : "requests"
    users ||--o{ custom_reports : "saves"
    users ||--o{ ai_estimations : "triggers"

    users {
        uuid id PK
        varchar full_name "NOT NULL"
        varchar email UK "NOT NULL"
        varchar password_hash
        varchar avatar_url
        varchar roles "global roles JSON/array"
        integer workload_percent "0-100"
        boolean is_email_verified
        boolean is_active
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
    }

    user_sessions {
        uuid id PK
        uuid user_id FK "NOT NULL -> users"
        varchar device_info
        varchar ip_address
        varchar token_hash "NOT NULL"
        boolean is_active
        timestamp expires_at
        timestamp created_at
    }

    user_settings {
        uuid id PK
        uuid user_id FK "NOT NULL UNIQUE -> users"
        varchar theme "dark | light | system"
        varchar language "en | es | fr | de"
        boolean email_notifications
        boolean push_notifications
        boolean ai_suggestions
        jsonb preferences
        timestamp updated_at
    }

    user_skills {
        uuid id PK
        uuid user_id FK "NOT NULL -> users"
        varchar skill_name "NOT NULL"
        timestamp created_at
    }

    %% ==========================================
    %% DOMAIN 2: PROJECTS & RBAC (Contextual Security)
    %% ==========================================
    projects ||--o{ project_members : "manages team"
    projects ||--o{ project_scoped_roles : "defines roles"
    projects ||--o{ project_permissions_def : "defines actions"
    projects ||--o{ milestones : "has"
    projects ||--o{ tasks : "contains"
    projects ||--o{ activity_logs : "tracked in"
    projects ||--o{ reports : "generates analytics"
    projects ||--o{ ai_plan_sessions : "planned by"
    projects ||--o{ time_entries : "tracks time for"
    projects ||--|| project_budgets : "allocates"

    project_scoped_roles ||--o{ project_role_permissions : "granted"
    project_permissions_def ||--o{ project_role_permissions : "mapped to"
    project_scoped_roles ||--o{ project_members : "assigned to"

    projects {
        uuid id PK
        uuid created_by FK "NOT NULL -> users"
        varchar name "NOT NULL"
        text description
        varchar status "planning | active | completed | archived"
        varchar priority "low | medium | high"
        integer progress "0-100"
        date start_date
        date end_date
        boolean is_ai_generated "DEFAULT false"
        timestamp created_at
        timestamp updated_at
    }

    project_members {
        uuid id PK
        uuid project_id FK "NOT NULL -> projects"
        uuid user_id FK "NOT NULL -> users"
        uuid project_scoped_role_id FK "NOT NULL -> project_scoped_roles"
        varchar role "fallback string label"
        timestamp joined_at
    }

    project_scoped_roles {
        uuid id PK
        uuid project_id FK "NOT NULL -> projects"
        varchar role_name "NOT NULL e.g., PM, Developer, Viewer"
        text description
        timestamp created_at
    }

    project_permissions_def {
        uuid id PK
        uuid project_id FK "NOT NULL -> projects"
        varchar permission_key "NOT NULL e.g., task:edit, budget:view"
        timestamp created_at
    }

    project_role_permissions {
        uuid id PK
        uuid role_id FK "NOT NULL -> project_scoped_roles"
        uuid permission_def_id FK "NOT NULL -> project_permissions_def"
    }

    project_budgets {
        uuid id PK
        uuid project_id FK "NOT NULL UNIQUE -> projects"
        decimal total_allocated "NOT NULL"
        decimal total_spent "DEFAULT 0.00"
        decimal estimated_remaining
    }

    milestones {
        uuid id PK
        uuid project_id FK "NOT NULL -> projects"
        uuid ai_creation_prompt_id FK "nullable -> ai_creation_prompts"
        varchar title "NOT NULL"
        text description
        varchar status
        integer progress
        date target_date
        boolean is_ai_generated "DEFAULT false"
        timestamp created_at
    }

    %% ==========================================
    %% DOMAIN 3: TASKS & KNOWLEDGE BASE (Vector Search)
    %% ==========================================
    tasks ||--o{ subtasks : "broken into"
    tasks ||--o{ task_assignees : "assigned to"
    tasks ||--o{ comments : "discussed in"
    tasks ||--o{ attachments : "has attachments"
    tasks ||--o{ task_dependencies : "depends on (dependent)"
    tasks ||--o{ task_dependencies : "prerequisite for (blocks)"
    tasks ||--o{ time_entries : "tracked by"
    tasks ||--o{ ai_estimations : "evaluated by"
    milestones ||--o{ tasks : "groups"

    tasks {
        uuid id PK
        uuid project_id FK "NOT NULL -> projects"
        uuid milestone_id FK "nullable -> milestones"
        uuid created_by FK "NOT NULL -> users"
        varchar title "NOT NULL"
        text description
        varchar type "feature | bug | improvement"
        varchar status "backlog | todo | in-progress | done"
        varchar priority "low | medium | high | urgent"
        varchar label
        boolean is_ai_suggested "DEFAULT false"
        date due_date
        vector ai_complexity_vector "vector(1536)"
        vector ai_risk_score "vector(1536)"
        timestamp completed_at
        timestamp created_at
    }

    subtasks {
        uuid id PK
        uuid task_id FK "NOT NULL -> tasks"
        varchar title "NOT NULL"
        boolean is_completed "DEFAULT false"
        timestamp created_at
    }

    task_assignees {
        uuid id PK
        uuid task_id FK "NOT NULL -> tasks"
        uuid user_id FK "NOT NULL -> users"
        boolean is_primary "DEFAULT false"
    }

    task_dependencies {
        uuid id PK
        uuid task_id FK "NOT NULL -> tasks (dependent)"
        uuid depends_on_task_id FK "NOT NULL -> tasks (prerequisite)"
        varchar type "blocks | requires"
    }

    comments {
        uuid id PK
        uuid task_id FK "NOT NULL -> tasks"
        uuid user_id FK "NOT NULL -> users"
        uuid parent_comment_id FK "nullable -> comments (threading)"
        text content "NOT NULL"
        timestamp created_at
    }

    attachments {
        uuid id PK
        uuid task_id FK "NOT NULL -> tasks"
        uuid uploaded_by FK "NOT NULL -> users"
        varchar file_name "NOT NULL"
        varchar file_url "NOT NULL"
        varchar file_type
        bigint file_size_bytes
        timestamp created_at
    }

    knowledge_base_chunks {
        uuid id PK
        varchar source_type "NOT NULL e.g., task, attachment"
        uuid source_id "NOT NULL link to source table"
        text text_chunk "NOT NULL parsed text content"
        vector embedding "NOT NULL vector(1536)"
    }

    %% ==========================================
    %% DOMAIN 4: AI FEATURES
    %% ==========================================
    ai_plan_sessions ||--o{ ai_creation_prompts : "generated via"
    ai_creation_prompts ||--o{ ai_prompt_snapshots : "captures variables"
    ai_conversations ||--o{ ai_messages : "contains"

    ai_plan_sessions {
        uuid id PK
        uuid project_id FK "NOT NULL -> projects"
        jsonb generated_plan
        jsonb generated_structure_snapshot
        jsonb proposed_milestones_snapshot
        jsonb proposed_tasks_snapshot
        varchar status "proposed | accepted | rejected | archived"
        timestamp created_at
    }

    ai_creation_prompts {
        uuid id PK
        uuid project_id FK "NOT NULL -> projects"
        uuid user_id FK "NOT NULL -> users"
        text primary_prompt_text "NOT NULL raw user prompt"
        varchar prompt_type "e.g., initial_generation, restructuring"
        varchar context_tags
        timestamp created_at
    }

    ai_prompt_snapshots {
        uuid id PK
        uuid creation_prompt_id FK "NOT NULL -> ai_creation_prompts"
        jsonb prompt_version_metadata
        text prompt_text_at_generation
    }

    ai_conversations {
        uuid id PK
        uuid user_id FK "NOT NULL -> users"
        varchar context_type "general | project | task"
        uuid context_id "nullable target asset id"
        timestamp created_at
    }

    ai_messages {
        uuid id PK
        uuid conversation_id FK "NOT NULL -> ai_conversations"
        uuid session_fk FK "nullable -> users"
        varchar role "user | assistant"
        text content "NOT NULL"
        vector content_embedding "vector(1536) for memory recall"
        timestamp created_at
    }

    ai_estimations {
        uuid id PK
        uuid task_id FK "nullable -> tasks"
        uuid user_id FK "NOT NULL -> users"
        vector description_embedding "vector(1536)"
        integer estimated_hours
        integer confidence_score "0-100"
        timestamp created_at
    }

    ai_insights_logs {
        uuid id PK
        uuid propsset_id FK "nullable -> projects"
        uuid initiated_fk FK "NOT NULL -> users"
        varchar reference_type "e.g., task, member, scope"
        uuid reference_id
        varchar insight_type "risk | optimization | warning"
        text message
        vector insight_embedding "vector(1536)"
        decimal score
        timestamp created_at
    }

    %% ==========================================
    %% DOMAIN 5: REPORTS & TIME TRACKING
    %% ==========================================
    reports ||--o{ report_snapshots : "freezes metric records"
    custom_reports ||--o{ reports : "templates query structure"

    reports {
        uuid id PK
        uuid project_id FK "nullable -> projects"
        uuid generated_by FK "NOT NULL -> users"
        varchar title "NOT NULL"
        varchar type "performance | velocity | financial"
        varchar status "generating | ready | failed"
        varchar format "pdf | csv | json"
        timestamp generated_at
    }

    report_snapshots {
        uuid id PK
        uuid report_id FK "NOT NULL -> reports"
        uuid user_id FK "NOT NULL -> users"
        varchar metric_name "NOT NULL"
        varchar metric_value
        jsonb chart_data
        timestamp captured_at
    }

    custom_reports {
        uuid id PK
        uuid user_id FK "NOT NULL -> users"
        varchar name "NOT NULL"
        jsonb query_config "filters, dimensions, bounds"
        jsonb layout_config "widgets, visual properties"
    }

    time_entries {
        uuid id PK
        uuid user_id FK "NOT NULL -> users"
        uuid project_id FK "NOT NULL -> projects"
        uuid task_id FK "nullable -> tasks"
        integer duration_minutes "NOT NULL"
        timestamp start_time
        timestamp end_time
        text description
        date entry_date
    }

    activity_logs {
        uuid id PK
        uuid project_id FK "nullable -> projects"
        uuid user_id FK "NOT NULL -> users"
        varchar action "created | updated | deleted | merged"
        varchar entity_type "task | project | milestone | comment"
        uuid entity_id "polymorphic context link"
        text description
        jsonb metadata
        timestamp created_at
    }

    notifications {
        uuid id PK
        uuid user_id FK "NOT NULL -> users"
        varchar title "NOT NULL"
        text message
        varchar reference_type "task | project | comment"
        uuid reference_id "polymorphic context link"
        boolean is_read "DEFAULT false"
        timestamp created_at
    }
