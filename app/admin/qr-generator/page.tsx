'use client'

import { useEffect, useRef, useState } from 'react'
import { QrCode, RotateCcw, Download } from 'lucide-react'

declare global {
  interface Window {
    QRCode: any
  }
}

const PRESETS = [
  { label: 'Ascend', url: 'https://ciarajevans.com/connect-with-ascend' },
  { label: 'Book Ciara', url: 'https://ciarajevans.com/booking' },
  { label: 'Client Portal', url: 'https://ciarajevans.com/login' },
]

export default function AdminQRGeneratorPage() {
  const [url, setUrl] = useState('https://ciarajevans.com/connect-with-ascend')
  const [fg, setFg] = useState('#81D8D0')
  const [bg, setBg] = useState('#0a0a0a')
  const [size, setSize] = useState(256)
  const [generated, setGenerated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [libLoaded, setLibLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.QRCode) {
      setLibLoaded(true)
      return
    }
    const existing = document.getElementById('qrcodejs-script')
    if (existing) {
      existing.addEventListener('load', () => setLibLoaded(true))
      return
    }
    const script = document.createElement('script')
    script.id = 'qrcodejs-script'
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
    script.onload = () => setLibLoaded(true)
    document.head.appendChild(script)
  }, [])

  function generate() {
    setError(null)
    if (!url.trim()) {
      setError('Please enter a URL.')
      return
    }
    if (!libLoaded || !window.QRCode) {
      setError('QR library not loaded yet. Try again in a moment.')
      return
    }
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    try {
      new window.QRCode(containerRef.current, {
        text: url.trim(),
        width: size,
        height: size,
        colorDark: fg,
        colorLight: bg,
        correctLevel: window.QRCode.CorrectLevel.H,
      })
      setGenerated(true)
    } catch {
      setError('Could not generate QR code. Check your URL and try again.')
    }
  }

  function reset() {
    setFg('#81D8D0')
    setBg('#0a0a0a')
    setSize(256)
  }

  function getCanvas() {
    return containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null
  }

  function downloadPNG() {
    const canvas = getCanvas()
    if (!canvas) return
    const slug = url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-').slice(0, 40)
    const link = document.createElement('a')
    link.download = `qr-${slug}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function downloadSVG() {
    const canvas = getCanvas()
    if (!canvas) return
    const slug = url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-').slice(0, 40)
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
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-[#81D8D0]" />
            <span className="text-[#81D8D0] text-sm font-medium uppercase tracking-wider">Admin</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-white">QR Generator</h1>
          <p className="text-[#a1a1a1]">Create branded QR codes for any link.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Left — Controls */}
          <div className="space-y-5">

            {/* Presets */}
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5">
              <p className="text-xs font-medium text-[#a1a1a1] uppercase tracking-wide mb-3">Quick presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setUrl(p.url)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      url === p.url
                        ? 'bg-[#81D8D0] text-[#0a0a0a] border-[#81D8D0]'
                        : 'bg-[#0a0a0a] text-[#a1a1a1] border-[#333333] hover:border-[#81D8D0]/50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 space-y-4">

              {/* URL */}
              <div>
                <label className="block text-xs font-medium text-[#a1a1a1] uppercase tracking-wide mb-2">
                  URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generate()}
                  placeholder="https://ciarajevans.com/..."
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#81D8D0]/50 transition-colors"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#a1a1a1] uppercase tracking-wide mb-2">
                    Foreground
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fg}
                      onChange={(e) => setFg(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-[#333333] bg-[#0a0a0a] cursor-pointer p-1"
                    />
                    <span className="text-xs text-[#a1a1a1] font-mono">{fg}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#a1a1a1] uppercase tracking-wide mb-2">
                    Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bg}
                      onChange={(e) => setBg(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-[#333333] bg-[#0a0a0a] cursor-pointer p-1"
                    />
                    <span className="text-xs text-[#a1a1a1] font-mono">{bg}</span>
                  </div>
                </div>
              </div>

              {/* Size slider */}
              <div>
                <label className="block text-xs font-medium text-[#a1a1a1] uppercase tracking-wide mb-2">
                  Size — {size}px
                </label>
                <input
                  type="range"
                  min={128}
                  max={512}
                  step={32}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-[#81D8D0]"
                />
                <div className="flex justify-between text-xs text-[#555] mt-1">
                  <span>128px</span>
                  <span>512px</span>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={generate}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#81D8D0] text-[#0a0a0a] text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#81D8D0]/90 transition-colors"
                >
                  <QrCode size={15} />
                  Generate
                </button>
                <button
                  onClick={reset}
                  title="Reset to brand defaults"
                  className="flex items-center justify-center px-3 py-2.5 rounded-lg border border-[#333333] text-[#a1a1a1] hover:border-[#81D8D0]/50 transition-colors"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Right — Preview */}
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 flex flex-col items-center justify-center min-h-[400px]">

            {/* QR container — always in DOM so ref works, hidden until generated */}
            <div
              ref={containerRef}
              className="rounded-xl overflow-hidden mb-5"
              style={{
                padding: '16px',
                background: bg,
                display: generated ? 'block' : 'none',
              }}
            />

            {/* Placeholder */}
            {!generated && (
              <div className="text-center mb-5">
                <div className="w-16 h-16 rounded-xl bg-[#0a0a0a] border border-[#333333] flex items-center justify-center mx-auto mb-4">
                  <QrCode size={28} className="text-[#333333]" />
                </div>
                <p className="text-[#555] text-sm">Your QR code will appear here</p>
              </div>
            )}

            {/* Download buttons */}
            {generated && (
              <div className="w-full space-y-2">
                <button
                  onClick={downloadPNG}
                  className="w-full flex items-center justify-center gap-2 bg-[#81D8D0] text-[#0a0a0a] text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#81D8D0]/90 transition-colors"
                >
                  <Download size={15} />
                  Download PNG
                </button>
                <button
                  onClick={downloadSVG}
                  className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] border border-[#333333] text-[#a1a1a1] text-sm font-medium px-4 py-2.5 rounded-lg hover:border-[#81D8D0]/50 transition-colors"
                >
                  <Download size={15} />
                  Download SVG
                </button>
                <p className="text-center text-xs text-[#555] pt-1">
                  PNG for print · SVG scales to any size
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}