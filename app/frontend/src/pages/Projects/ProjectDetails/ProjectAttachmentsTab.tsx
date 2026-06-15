import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Card } from '../../../components/ui'
import {
  useProjectAttachments,
  useUploadProjectAttachment,
  useDeleteAttachment,
} from '../../../hooks/useAttachments'
import type { AttachmentResponseDto } from '@orchest/shared'

// ─── File type icon helper ─────────────────────────────────────────────────

function getFileIcon(mimeType?: string | null): { icon: string; color: string } {
  if (!mimeType) return { icon: 'attach_file', color: 'text-on-surface-variant' }
  if (mimeType.startsWith('image/')) return { icon: 'image', color: 'text-purple-400' }
  if (mimeType === 'application/pdf') return { icon: 'picture_as_pdf', color: 'text-red-400' }
  if (mimeType.includes('word') || mimeType.includes('document')) return { icon: 'description', color: 'text-blue-400' }
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) return { icon: 'table_chart', color: 'text-emerald-400' }
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return { icon: 'slideshow', color: 'text-orange-400' }
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('gzip')) return { icon: 'folder_zip', color: 'text-amber-400' }
  if (mimeType.startsWith('video/')) return { icon: 'videocam', color: 'text-pink-400' }
  if (mimeType.startsWith('audio/')) return { icon: 'audio_file', color: 'text-cyan-400' }
  if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml')) return { icon: 'code', color: 'text-electric-blue' }
  return { icon: 'attach_file', color: 'text-on-surface-variant' }
}

function formatBytes(bytes?: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Upload Drop Zone ──────────────────────────────────────────────────────

interface DropZoneProps {
  onFileSelect: (file: File) => void
  isUploading: boolean
}

function DropZone({ onFileSelect, isUploading }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !isUploading && inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-10 flex flex-col items-center gap-3 select-none
        ${isDragOver
          ? 'border-electric-blue/70 bg-electric-blue/5 scale-[1.01]'
          : 'border-white/10 bg-surface-container-low hover:border-electric-blue/40 hover:bg-electric-blue/5'
        }
        ${isUploading ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragOver ? 'bg-electric-blue/20 text-electric-blue' : 'bg-white/5 text-on-surface-variant'}`}>
        {isUploading ? (
          <div className="w-6 h-6 border-2 border-electric-blue border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-on-surface">
          {isUploading ? 'Uploading…' : isDragOver ? 'Drop to upload' : 'Drag & drop or click to upload'}
        </p>
        <p className="text-xs text-on-surface-variant mt-1">Any file type · Max 10 MB</p>
      </div>
    </div>
  )
}

// ─── Attachment Card ───────────────────────────────────────────────────────

interface AttachmentCardProps {
  attachment: AttachmentResponseDto
  currentUserId: string
  isOwner: boolean
  onDelete: (id: string) => void
  isDeleting: boolean
}

function AttachmentCard({ attachment, currentUserId, isOwner, onDelete, isDeleting }: AttachmentCardProps) {
  const { icon, color } = getFileIcon(attachment.fileType)
  const canDelete = isOwner || attachment.uploadedBy === currentUserId

  return (
    <div className="group/att flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-white/5 hover:border-electric-blue/20 hover:bg-electric-blue/[0.03] transition-all duration-150">
      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 ${color}`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface truncate">{attachment.fileName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-on-surface-variant">{formatBytes(attachment.fileSizeBytes)}</span>
          <span className="text-[11px] text-on-surface-variant/40">·</span>
          <span className="text-[11px] text-on-surface-variant">
            {new Date(attachment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/att:opacity-100 transition-opacity">
        <a
          href={attachment.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={attachment.fileName}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-electric-blue hover:bg-electric-blue/10 transition-colors"
          title="Download"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
        </a>
        {canDelete && (
          <button
            onClick={() => onDelete(attachment.id)}
            disabled={isDeleting}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-400/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Delete attachment"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Tab Component ────────────────────────────────────────────────────

interface ProjectAttachmentsTabProps {
  projectId: string
  currentUserId: string
  isOwner: boolean
}

export default function ProjectAttachmentsTab({ projectId, currentUserId, isOwner }: ProjectAttachmentsTabProps) {
  const { data: attachments = [], isLoading, isError } = useProjectAttachments(projectId)
  const uploadMutation = useUploadProjectAttachment(projectId)
  const deleteMutation = useDeleteAttachment({ projectId })

  const handleUpload = (file: File) => {
    uploadMutation.mutate(file, {
      onSuccess: () => toast.success(`"${file.name}" uploaded successfully`),
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || 'Upload failed'
        toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      },
    })
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Attachment deleted'),
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || 'Delete failed'
        toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h3 className="font-heading text-lg font-semibold text-on-surface">Project Attachments</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Upload documents, designs, or any files related to this project.
          {!isOwner && <span className="ml-1">Only the uploader or project owner can delete files.</span>}
        </p>
      </div>

      {/* Upload Zone */}
      <DropZone onFileSelect={handleUpload} isUploading={uploadMutation.isPending} />

      {/* File List */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h4 className="font-heading text-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">folder_open</span>
            Files
            {attachments.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-electric-blue/15 text-electric-blue">
                {attachments.length}
              </span>
            )}
          </h4>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[62px] rounded-xl bg-surface-container-low border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <span className="material-symbols-outlined text-[36px] text-red-400 mb-2">error</span>
            <p className="text-sm text-on-surface-variant">Failed to load attachments.</p>
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <span className="material-symbols-outlined text-[44px] text-on-surface-variant/30 mb-3">attach_file</span>
            <p className="text-sm text-on-surface-variant font-medium">No attachments yet</p>
            <p className="text-xs text-on-surface-variant/60 mt-1">Upload a file above to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {attachments.map((att) => (
              <AttachmentCard
                key={att.id}
                attachment={att}
                currentUserId={currentUserId}
                isOwner={isOwner}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
