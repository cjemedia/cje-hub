'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { QrCode, RotateCcw, Download, Trash2, RefreshCw, Pencil, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

declare global {
  interface Window { QRCode: any }
}

type SavedQR = {
  id: string
  label: string
  url: string
  fg_color: string
  bg_color: string
  size: number
  created_at: string
}

const PRESETS = [
  { label: 'Ascend', url: 'https://ciarajevans.com/connect-with-ascend' },
  { label: 'Book Ciara', url: 'https://ciarajevans.com/booking' },
  { label: 'Client Portal', url: 'https://ciarajevans.com/login' },
]

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ciarajevans.com'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function buildRedirectUrl(id: string) {
  return `${SITE_URL}/qr/${id}`
}

export default function AdminQRGeneratorPage() {
  const supabase = createClient()

  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('https://ciarajevans.com/connect-with-ascend')
  const [fg, setFg] = useState('#81D8D0')
  const [bg, setBg] = useState('#0a0a0a')
  const [size, setSize] = useState(256)

  const [generated, setGenerated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [libLoaded, setLibLoaded] = useState(false)

  const [saved, setSaved] = useState<SavedQR[]>([])
  const [loadingSaved, setLoadingSaved] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [editLabel, setEditLabel] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.QRCode) { setLibLoaded(true); return }
    const existing = document.getElementById('qrcodejs-script')
    if (existing) { existing.addEventListener('load', () => setLibLoaded(true)); return }
    const script = document.createElement('script')
    script.id = 'qrcodejs-script'
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
    script.onload = () => setLibLoaded(true)
    document.head.appendChild(script)
  }, [])

  const fetchSaved = useCallback(async () => {
    setLoadingSaved(true)
    const { data } = await supabase.from('qr_codes').select('*').order('created_at', { ascending: false })
    if (data) setSaved(data)
    setLoadingSaved(false)
  }, [supabase])

  useEffect(() => { fetchSaved() }, [fetchSaved])

  function renderQR(qrUrl: string, qrFg: string, qrBg: string, qrSize: number) {
    if (!containerRef.current || !window.QRCode) return
    containerRef.current.innerHTML = ''
    new window.QRCode(containerRef.current, {
      text: qrUrl,
      width: qrSize,
      height: qrSize,
      colorDark: qrFg,
      colorLight: qrBg,
      correctLevel: window.QRCode.CorrectLevel.H,
    })
  }

  async function saveAndGenerate() {
    setError(null)
    if (!label.trim()) { setError('Add a label first.'); return }
    if (!url.trim()) { setError('Please enter a destination URL.'); return }
    if (!libLoaded || !window.QRCode) { setError('QR library not loaded yet. Try again.'); return }

    setSaving(true)
    const { data, error: insertError } = await supabase
      .from('qr_codes')
      .insert([{ label: label.trim(), url: url.trim(), fg_color: fg, bg_color: bg, size }])
      .select('id')
      .single()
    setSaving(false)

    if (insertError || !data?.id) { setError('Could not save. Try again.'); return }

    setSavedId(data.id)
    await fetchSaved()

    try {
      renderQR(buildRedirectUrl(data.id), fg, bg, size)
      setGenerated(true)
    } catch {
      setError('Saved but could not render QR. Try reloading.')
    }
  }

  function loadSaved(qr: SavedQR) {
    setLabel(qr.label)
    setUrl(qr.url)
    setFg(qr.fg_color)
    setBg(qr.bg_color)
    setSize(qr.size)
    setSavedId(qr.id)
    setGenerated(false)
    setError(null)
    setTimeout(() => {
      renderQR(buildRedirectUrl(qr.id), qr.fg_color, qr.bg_color, qr.size)
      setGenerated(true)
    }, 50)
  }

  async function deleteQR(id: string) {
    await supabase.from('qr_codes').delete().eq('id', id)
    setSaved((prev) => prev.filter((q) => q.id !== id))
    if (savedId === id) { setGenerated(false); setSavedId(null) }
  }

  function startEdit(qr: SavedQR) {
    setEditingId(qr.id)
    setEditUrl(qr.url)
    setEditLabel(qr.label)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditUrl('')
    setEditLabel('')
  }

  async function saveEdit(id: string) {
    if (!editUrl.trim() || !editLabel.trim()) return
    setEditSaving(true)
    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({ url: editUrl.trim(), label: editLabel.trim() })
      .eq('id', id)
    setEditSaving(false)
    if (updateError) return
    setSaved((prev) => prev.map((q) => q.id === id ? { ...q, url: editUrl.trim(), label: editLabel.trim() } : q))
    if (savedId === id) { setUrl(editUrl.trim()); setLabel(editLabel.trim()) }
    cancelEdit()
  }

  function reset() { setFg('#81D8D0'); setBg('#0a0a0a'); setSize(256) }

  function getCanvas() {
    return containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null
  }

  function downloadPNG() {
    const canvas = getCanvas()
    if (!canvas) return
    const slug = label.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40) || 'qr-code'
    const link = document.createElement('a')
    link.download = `qr-${slug}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function downloadSVG() {
    const canvas = getCanvas()
    if (!canvas) return
    const slug = label.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40) || 'qr-code'
    const dataUrl = canvas.toDataURL('image/png')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${bg}"/>
  <image href="${dataUrl}" width="${size}" height="${size}"/>
</svg>`
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const link = document.createElement('a')
    link.download = `qr-${slug}.svg`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-[#81D8D0]" />
            <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-white">QR Generator</h1>
          <p className="text-[#a1a1a1]">QR codes use a stable redirect — update the destination anytime without reprinting.</p>
        </div>

        {/* Generator grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Controls */}
          <div className="space-y-4">

            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5">
              <p className="text-xs font-medium text-[#a1a1a1] uppercase tracking-wide mb-3">Quick presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button key={p.label}
                    onClick={() => { setUrl(p.url); setLabel(p.label); setGenerated(false); setSavedId(null) }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      url === p.url
                        ? 'bg-[#81D8D0] text-[#0a0a0a] border-[#81D8D0]'
                        : 'bg-[#0a0a0a] text-[#a1a1a1] border-[#333333] hover:border-[#81D8D0]/50'
                    }`}>{p.label}</button>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 space-y-4">

              <div>
                <label className="block text-xs font-medium text-[#a1a1a1] uppercase tracking-wide mb-2">
                  Label <span className="text-[#555] normal-case font-normal">(for your records)</span>
                </label>
                <input type="text" value={label} onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Ascend QR Code"
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#81D8D0]/50 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1a1] uppercase tracking-wide mb-2">Destination URL</label>
                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://ciarajevans.com/..."
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#81D8D0]/50 transition-colors" />
                <p className="text-xs text-[#555] mt-1.5">Can be changed later without reprinting.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#a1a1a1] uppercase tracking-wide mb-2">Foreground</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={fg} onChange={(e) => setFg(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-[#333333] bg-[#0a0a0a] cursor-pointer p-1" />
                    <span className="text-xs text-[#a1a1a1] font-mono">{fg}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#a1a1a1] uppercase tracking-wide mb-2">Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bg} onChange={(e) => setBg(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-[#333333] bg-[#0a0a0a] cursor-pointer p-1" />
                    <span className="text-xs text-[#a1a1a1] font-mono">{bg}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1a1] uppercase tracking-wide mb-2">Size — {size}px</label>
                <input type="range" min={128} max={512} step={32} value={size}
                  onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-[#81D8D0]" />
                <div className="flex justify-between text-xs text-[#555] mt-1"><span>128px</span><span>512px</span></div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button onClick={saveAndGenerate} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#81D8D0] text-[#0a0a0a] text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#81D8D0]/90 transition-colors disabled:opacity-50">
                  <QrCode size={15} />
                  {saving ? 'Saving...' : 'Save & Generate'}
                </button>
                <button onClick={reset} title="Reset to brand defaults"
                  className="flex items-center justify-center px-3 py-2.5 rounded-lg border border-[#333333] text-[#a1a1a1] hover:border-[#81D8D0]/50 transition-colors">
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 flex flex-col items-center justify-center min-h-[420px]">

            <div ref={containerRef} className="rounded-xl overflow-hidden mb-5"
              style={{ padding: '16px', background: bg, display: generated ? 'block' : 'none' }} />

            {!generated && (
              <div className="text-center mb-5">
                <div className="w-16 h-16 rounded-xl bg-[#0a0a0a] border border-[#333333] flex items-center justify-center mx-auto mb-4">
                  <QrCode size={28} className="text-[#333333]" />
                </div>
                <p className="text-[#555] text-sm">Fill in the label and URL,<br />then click Save & Generate.</p>
              </div>
            )}

            {generated && savedId && (
              <div className="w-full space-y-2">
                <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 mb-1">
                  <p className="text-xs text-[#555] mb-0.5">QR points to (stable)</p>
                  <p className="text-xs text-[#81D8D0] font-mono break-all">{buildRedirectUrl(savedId)}</p>
                </div>
                <button onClick={downloadPNG}
                  className="w-full flex items-center justify-center gap-2 bg-[#81D8D0] text-[#0a0a0a] text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#81D8D0]/90 transition-colors">
                  <Download size={15} /> Download PNG
                </button>
                <button onClick={downloadSVG}
                  className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] border border-[#333333] text-[#a1a1a1] text-sm font-medium px-4 py-2.5 rounded-lg hover:border-[#81D8D0]/50 transition-colors">
                  <Download size={15} /> Download SVG
                </button>
                <p className="text-center text-xs text-[#555] pt-1">PNG for print · SVG scales to any size</p>
              </div>
            )}
          </div>
        </div>

        {/* Library */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#333333]">
            <div>
              <h2 className="text-lg font-semibold text-white">Saved QR Codes</h2>
              <p className="text-xs text-[#555] mt-0.5">Click the pencil icon to update where a QR code redirects — no reprinting needed.</p>
            </div>
            <button onClick={fetchSaved} className="text-[#a1a1a1] hover:text-white transition-colors" title="Refresh">
              <RefreshCw size={15} />
            </button>
          </div>

          {loadingSaved ? (
            <div className="text-center py-12 text-[#a1a1a1] text-sm">Loading...</div>
          ) : saved.length === 0 ? (
            <div className="text-center py-12 text-[#555] text-sm">No QR codes saved yet.</div>
          ) : (
            <div className="divide-y divide-[#333333]">
              {saved.map((qr) => (
                <div key={qr.id} className="px-6 py-4 hover:bg-[#0a0a0a] transition-colors">
                  {editingId === qr.id ? (
                    <div className="space-y-2">
                      <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="Label"
                        className="w-full bg-[#0a0a0a] border border-[#81D8D0]/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#81D8D0] transition-colors" />
                      <input type="text" value={editUrl} onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="Destination URL"
                        className="w-full bg-[#0a0a0a] border border-[#81D8D0]/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#81D8D0] transition-colors" />
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => saveEdit(qr.id)} disabled={editSaving}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#81D8D0] text-[#0a0a0a] rounded-lg hover:bg-[#81D8D0]/90 transition-colors disabled:opacity-50">
                          <Check size={13} /> {editSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#333333] text-[#a1a1a1] rounded-lg hover:border-[#81D8D0]/50 transition-colors">
                          <X size={13} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex-shrink-0 border border-[#333333] overflow-hidden grid grid-cols-2">
                          <div style={{ background: qr.fg_color }} />
                          <div style={{ background: qr.bg_color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{qr.label}</p>
                          <p className="text-[#555] text-xs truncate">{qr.url}</p>
                          <p className="text-[#555] text-xs mt-0.5">{formatDate(qr.created_at)} · {qr.size}px</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => loadSaved(qr)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#333333] text-[#a1a1a1] hover:border-[#81D8D0]/50 hover:text-white transition-colors">
                          Load
                        </button>
                        <button onClick={() => startEdit(qr)}
                          className="p-1.5 rounded-lg text-[#555] hover:text-[#81D8D0] transition-colors" title="Edit destination URL">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteQR(qr.id)}
                          className="p-1.5 rounded-lg text-[#555] hover:text-red-400 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}