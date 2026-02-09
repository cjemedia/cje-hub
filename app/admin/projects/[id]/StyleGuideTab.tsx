'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Trash, Pencil, Upload } from 'lucide-react'

type Props = {
  projectId: string
  projectData: any
  projectClients: any[]
  onReload: () => Promise<void>
}

export default function StyleGuideTab({ projectId, projectData, projectClients, onReload }: Props) {
  const hasHtml = !!projectData?.style_guide_html
  const hasUrl = !!projectData?.style_guide_url
  const [mode, setMode] = useState<'link' | 'html'>(hasHtml ? 'html' : 'link')

  // Link mode
  const [linkForm, setLinkForm] = useState({ url: '', message: '' })
  const [sendingLink, setSendingLink] = useState(false)
  const [editingLink, setEditingLink] = useState(false)

  // HTML mode
  const [htmlContent, setHtmlContent] = useState(projectData?.style_guide_html || '')
  const [savingHtml, setSavingHtml] = useState(false)
  const [sendingHtml, setSendingHtml] = useState(false)

  // === LINK MODE ===
  const normalizeUrl = (url: string) => {
    if (!url) return ''
    if (!url.startsWith('http://') && !url.startsWith('https://')) return 'https://' + url
    return url
  }

  const handleSendLink = async () => {
    if (!linkForm.url.trim()) return
    setSendingLink(true)
    try {
      await fetch('/api/projects/' + projectId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style_guide_url: normalizeUrl(linkForm.url.trim()),
          style_guide_sent_at: new Date().toISOString(),
        }),
      })
      setLinkForm({ url: '', message: '' })
      await onReload()
    } catch {
      alert('Failed to send style guide')
    }
    setSendingLink(false)
  }

  const handleDeleteLink = async () => {
    if (!confirm('Delete this style guide link?')) return
    await fetch('/api/projects/' + projectId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ style_guide_url: null, style_guide_sent_at: null }),
    })
    await onReload()
  }

  // === HTML MODE ===
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setHtmlContent(ev.target?.result as string)
    reader.readAsText(file)
  }

  const handleSave = async () => {
    if (!htmlContent.trim()) { alert('Upload an HTML file first.'); return }
    setSavingHtml(true)
    try {
      await fetch('/api/projects/' + projectId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style_guide_html: htmlContent,
          style_guide_status: projectData?.style_guide_status || 'draft',
        }),
      })
      await onReload()
    } catch { alert('Failed to save.') }
    setSavingHtml(false)
  }

  const handleSend = async () => {
    if (!htmlContent.trim()) { alert('Save first.'); return }
    if (!confirm('Send this style guide to the client?')) return
    setSendingHtml(true)
    try {
      await fetch('/api/projects/' + projectId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style_guide_html: htmlContent,
          style_guide_status: 'sent',
          style_guide_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      })
      await onReload()
    } catch { alert('Failed to send.') }
    setSendingHtml(false)
  }

  const handleDeleteHtml = async () => {
    if (!confirm('Delete this style guide?')) return
    await fetch('/api/projects/' + projectId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        style_guide_html: null,
        style_guide_status: null,
        style_guide_expires_at: null,
      }),
    })
    setHtmlContent('')
    await onReload()
  }

  const guideLink = (typeof window !== 'undefined' ? window.location.origin : '') + '/style-guides/' + projectId

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      {!hasHtml && !hasUrl && (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
          <p className="text-white font-semibold mb-3">Create Style Guide</p>
          <div className="flex gap-2">
            <button onClick={() => setMode('link')} className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (mode === 'link' ? 'bg-[#81D8D0] text-[#0a0a0a]' : 'border border-[#333] text-white hover:border-[#81D8D0]/60')}>
              Paste Link
            </button>
            <button onClick={() => setMode('html')} className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (mode === 'html' ? 'bg-[#81D8D0] text-[#0a0a0a]' : 'border border-[#333] text-white hover:border-[#81D8D0]/60')}>
              Upload HTML
            </button>
          </div>
        </div>
      )}

      {/* LINK MODE */}
      {mode === 'link' && !hasHtml && (
        <>
          {hasUrl && !editingLink ? (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-3">
              <h3 className="text-white font-semibold">Style Guide Link</h3>
              <a href={projectData.style_guide_url} target="_blank" rel="noopener noreferrer" className="text-[#81D8D0] hover:underline break-all">
                {projectData.style_guide_url}
              </a>
              {projectData.style_guide_sent_at && (
                <p className="text-[#a1a1a1] text-sm">Sent: {format(new Date(projectData.style_guide_sent_at), 'MMM d, yyyy p')}</p>
              )}
              <div className="flex gap-2 pt-2 border-t border-[#333]">
                <button onClick={() => { setEditingLink(true); setLinkForm({ url: projectData.style_guide_url || '', message: '' }) }} className="px-4 py-2 rounded-lg border border-[#333] text-white hover:border-[#81D8D0]/60">Update</button>
                <button onClick={handleDeleteLink} className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:border-red-500/80 flex items-center gap-2"><Trash size={16} />Delete</button>
              </div>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-3">
              <h3 className="text-white font-semibold">{editingLink ? 'Update Link' : 'Style Guide Link'}</h3>
              <input
                type="url"
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white"
                placeholder="https://your-style-guide.vercel.app"
                value={linkForm.url}
                onChange={(e) => setLinkForm(p => ({ ...p, url: e.target.value }))}
              />
              <textarea
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white resize-none"
                rows={3}
                placeholder="Message to client (optional)..."
                value={linkForm.message}
                onChange={(e) => setLinkForm(p => ({ ...p, message: e.target.value }))}
              />
              <div className="flex justify-end gap-2">
                {editingLink && (
                  <button onClick={() => { setEditingLink(false); setLinkForm({ url: '', message: '' }) }} className="px-4 py-2 rounded-lg border border-[#333] text-white">Cancel</button>
                )}
                <button onClick={handleSendLink} disabled={sendingLink || !linkForm.url.trim()} className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50">
                  {sendingLink ? 'Saving...' : editingLink ? 'Save' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* HTML MODE */}
      {(mode === 'html' || hasHtml) && (
        <>
          {/* Status */}
          {projectData?.style_guide_status && (
            <div className={'rounded-xl p-4 border ' + (
              projectData.style_guide_status === 'accepted' ? 'bg-green-500/10 border-green-500/30' :
              projectData.style_guide_status === 'viewed' ? 'bg-yellow-500/10 border-yellow-500/30' :
              projectData.style_guide_status === 'sent' ? 'bg-[#81D8D0]/10 border-[#81D8D0]/30' :
              'bg-[#1a1a1a] border-[#333]'
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Status: <span className="capitalize">{projectData.style_guide_status}</span></p>
                  {projectData.style_guide_status !== 'draft' && (
                    <p className="text-[#a1a1a1] text-sm mt-1">
                      <a href={guideLink} target="_blank" rel="noopener noreferrer" className="text-[#81D8D0] hover:underline">{guideLink}</a>
                    </p>
                  )}
                </div>
                <button onClick={handleDeleteHtml} className="px-3 py-1.5 rounded-lg border border-red-500/50 text-red-400 hover:border-red-500/80 text-sm flex items-center gap-1">
                  <Trash size={14} /> Delete
                </button>
              </div>
            </div>
          )}

          {/* Upload */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-3">
            <h3 className="text-white font-semibold">Style Guide HTML</h3>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#333] rounded-lg text-white hover:border-[#81D8D0]/60 cursor-pointer">
                <Upload size={16} />
                {htmlContent ? 'Replace HTML' : 'Upload HTML File'}
                <input type="file" accept=".html,.htm" className="hidden" onChange={handleFileUpload} />
              </label>
              {htmlContent && <span className="text-green-400 text-sm">HTML loaded ({Math.round(htmlContent.length / 1024)}KB)</span>}
            </div>
            {htmlContent && (
              <details className="text-sm">
                <summary className="text-[#81D8D0] cursor-pointer">Preview HTML</summary>
                <div className="mt-2 bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
              </details>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button onClick={handleSave} disabled={savingHtml || !htmlContent.trim()} className="px-4 py-2 rounded-lg border border-[#81D8D0] text-[#81D8D0] hover:bg-[#81D8D0]/10 font-semibold disabled:opacity-50">
              {savingHtml ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={handleSend} disabled={sendingHtml || !htmlContent.trim()} className="px-4 py-2 rounded-lg bg-[#81D8D0] text-[#0a0a0a] font-semibold hover:opacity-90 disabled:opacity-50">
              {sendingHtml ? 'Sending...' : projectData?.style_guide_status === 'sent' ? 'Resend' : 'Send to Client'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
