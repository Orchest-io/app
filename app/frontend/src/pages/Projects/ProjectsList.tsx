import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, ProgressBar, Button, Input, Select, TextArea } from '../../components/ui'
import { mockDb } from '../../utils/mockDb'

type Project = {
  id: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high'
  progress: number
  startDate?: string
  endDate?: string
}

export default function ProjectsList() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchProjects = () => {
    setLoading(true)
    setTimeout(() => {
      try {
        const data = mockDb.getProjects()
        setProjects(data as any)
      } catch (err: any) {
        toast.error('Failed to load projects: ' + err.message)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  useEffect(() => { fetchProjects() }, [])

  const filteredProjects = projects.filter((p) => {
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || p.status === statusFilter
    const matchPriority = !priorityFilter || p.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) { toast.warning('Please enter a project name'); return }
    try {
      setSubmitting(true)
      mockDb.createProject(formData as any)
      toast.success('Project created successfully!')
      setIsModalOpen(false)
      setFormData({ name: '', description: '', status: 'planning', priority: 'medium', startDate: '', endDate: '' })
      fetchProjects()
    } catch (err: any) {
      toast.error('Failed to create project: ' + err.message)
    } finally { setSubmitting(false) }
  }

  const priorityColor = (p: string) => p === 'high' ? 'text-red-400 bg-red-400/10 border-red-400/20' : p === 'medium' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'text-blue-400 bg-blue-400/10 border-blue-400/20'
  const statusColor = (s: string) => s === 'completed' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : s === 'active' ? 'text-electric-blue bg-electric-blue/10 border-electric-blue/20' : s === 'archived' ? 'text-on-surface-variant bg-surface-glass border-border-low' : 'text-purple-400 bg-purple-400/10 border-purple-400/20'

  const hasFilters = !!(search.trim() || statusFilter || priorityFilter)
  const clearFilters = () => { setSearch(''); setStatusFilter(''); setPriorityFilter('') }

  return (
    <div className="max-w-[1100px] mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-heading text-[32px] font-semibold text-on-surface">Workspace Projects</h2>
          <p className="text-sm text-on-surface-variant mt-1">Manage your project lifecycles, track phase progress, and coordinate delivery.</p>
        </div>
        <Button icon="add" onClick={() => navigate('/projects/create')}>New Project</Button>
      </div>

      <div className="p-4 rounded-xl bg-surface-glass border border-border-low mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Search Projects</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant pointer-events-none">search</span>
              <input type="text" placeholder="Search by name or description..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full py-2.5 pl-10 pr-4 bg-surface-container-low border border-border-low rounded-md text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:border-electric-blue/50 outline-none transition-colors" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 md:w-44">
            <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Status</label>
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full py-2.5 pl-4 pr-10 bg-surface-container-low border border-border-low rounded-md text-on-surface text-sm appearance-none cursor-pointer focus:border-electric-blue/50 outline-none transition-colors">
                <option value="">All Statuses</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 md:w-44">
            <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Priority</label>
            <div className="relative">
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full py-2.5 pl-4 pr-10 bg-surface-container-low border border-border-low rounded-md text-on-surface text-sm appearance-none cursor-pointer focus:border-electric-blue/50 outline-none transition-colors">
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 py-2.5 px-4 rounded-md border border-border-low text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all whitespace-nowrap">
              <span className="material-symbols-outlined text-[16px]">close</span>Clear
            </button>
          )}
        </div>
        {hasFilters && !loading && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border-low">
            <span className="text-xs text-on-surface-variant">{filteredProjects.length} of {projects.length} projects</span>
            {search.trim() && <span className="text-[11px] px-2 py-0.5 rounded-full bg-electric-blue/10 border border-electric-blue/20 text-electric-blue font-medium">"{search}"</span>}
            {statusFilter && <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-400 font-medium capitalize">{statusFilter}</span>}
            {priorityFilter && <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 font-medium capitalize">{priorityFilter} priority</span>}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3].map((i) => (<Card key={i} className="animate-pulse"><div className="h-6 bg-surface-container rounded w-1/3 mb-4"></div><div className="h-4 bg-surface-container rounded w-3/4 mb-3"></div><div className="h-2 bg-surface-container rounded w-full mb-3"></div></Card>))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="text-center py-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-surface-glass border border-border-low flex items-center justify-center text-on-surface-variant mb-4">
            <span className="material-symbols-outlined text-[32px]">{hasFilters ? 'search_off' : 'tactic'}</span>
          </div>
          <h3 className="font-heading text-xl font-bold mb-2">{hasFilters ? 'No Matching Projects' : 'No Projects Found'}</h3>
          <p className="text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">{hasFilters ? 'Try adjusting your search or filter criteria.' : 'Create your first project to get started.'}</p>
          {hasFilters ? <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button> : <Button icon="add" onClick={() => setIsModalOpen(true)}>Create Project</Button>}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} hoverable onClick={() => navigate(`/projects/${project.id}`)} className="flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="font-heading text-lg font-semibold text-on-surface hover:text-electric-blue transition-colors">{project.name}</h3>
                  <div className="flex gap-2 shrink-0">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${priorityColor(project.priority)}`}>{project.priority}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${statusColor(project.status)}`}>{project.status}</span>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant mb-6 line-clamp-3 leading-relaxed">{project.description || 'No description provided.'}</p>
              </div>
              <div>
                <div className="flex justify-between items-center text-xs text-on-surface-variant mb-2"><span>Progress</span><span className="font-semibold text-on-surface">{project.progress}%</span></div>
                <ProgressBar value={project.progress} glow className="mb-4" />
                <div className="flex justify-between items-center text-xs text-on-surface-variant pt-2 border-t border-border-low">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">chevron_right</span>View Details</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">Create New Project</h3>
              <button className="text-on-surface-variant hover:text-on-surface cursor-pointer" onClick={() => setIsModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input label="Project Name" placeholder="e.g. Core System Migration" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <TextArea label="Description" placeholder="Brief summary of the goals, context, and dependencies..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{value:'planning',label:'Planning'},{value:'active',label:'Active'},{value:'completed',label:'Completed'},{value:'archived',label:'Archived'}]} />
                <Select label="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} options={[{value:'low',label:'Low'},{value:'medium',label:'Medium'},{value:'high',label:'High'}]} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                <Input label="End Date" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Project'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
