'use client'

import { useRef, useState } from 'react'

// Matches the PDF size limit for documents sent to the Claude API.
export const MAX_FILE_SIZE_BYTES = 32 * 1024 * 1024

export type SelectedFile = {
  id: string
  file: File
}

export type FileUploadStatus =
  | { state: 'uploading' }
  | { state: 'success'; count: number }
  | { state: 'error'; message: string }

type FileDropzoneProps = {
  files: SelectedFile[]
  onFilesChange: (files: SelectedFile[]) => void
  // Per-file upload progress/result, keyed by SelectedFile.id.
  statuses?: Record<string, FileUploadStatus>
  disabled?: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileDropzone({ files, onFilesChange, statuses = {}, disabled }: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [rejection, setRejection] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(incoming: FileList) {
    setRejection(null)
    const accepted: SelectedFile[] = []

    for (const file of Array.from(incoming)) {
      if (file.type !== 'application/pdf') {
        setRejection(`"${file.name}" isn't a PDF.`)
        continue
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setRejection(`"${file.name}" is over the 32MB limit.`)
        continue
      }
      accepted.push({ id: crypto.randomUUID(), file })
    }

    if (accepted.length > 0) {
      onFilesChange([...files, ...accepted])
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    addFiles(e.dataTransfer.files)
  }

  function removeFile(id: string) {
    onFilesChange(files.filter(f => f.id !== id))
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click() }}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 ${
          disabled
            ? 'cursor-not-allowed border-zinc-800 opacity-50'
            : dragOver
              ? 'cursor-pointer border-zinc-400 bg-zinc-800/50'
              : 'cursor-pointer border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900/50'
        }`}
      >
        <svg className="h-8 w-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 7.5L12 3m0 0L7.5 7.5M12 3v13.5" />
        </svg>
        <p className="text-sm text-zinc-300">
          <span className="font-medium text-white">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-zinc-500">PDF, up to 32MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          disabled={disabled}
          onChange={e => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = '' }}
          className="hidden"
        />
      </div>

      {rejection && <p className="mt-2 text-xs text-red-400">{rejection}</p>}

      {files.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map(({ id, file }) => {
            const status = statuses[id]
            return (
              <li key={id} className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                <svg className="h-5 w-5 shrink-0 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-200">{file.name}</p>
                  <p className="text-xs text-zinc-500">
                    {status?.state === 'success' && `${status.count} biomarker${status.count === 1 ? '' : 's'} found`}
                    {status?.state === 'error' && <span className="text-red-400">{status.message}</span>}
                    {(!status || status.state === 'uploading') && formatFileSize(file.size)}
                  </p>
                </div>
                {status?.state === 'uploading' && (
                  <svg className="h-4 w-4 shrink-0 animate-spin text-zinc-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {status?.state === 'success' && (
                  <svg className="h-4 w-4 shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {(!status || status.state === 'error') && (
                  <button
                    type="button"
                    onClick={() => removeFile(id)}
                    disabled={disabled}
                    className="shrink-0 text-zinc-500 hover:text-zinc-200 disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
