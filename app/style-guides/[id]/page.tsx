import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import StyleGuideClient from './StyleGuideClient'

export default async function StyleGuidePage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, style_guide_html, style_guide_expires_at, style_guide_status')
    .eq('id', params.id)
    .maybeSingle()

  if (!project || !project.style_guide_html) {
    notFound()
  }

  const isExpired = project.style_guide_expires_at && new Date(project.style_guide_expires_at) < new Date()

  if (project.style_guide_status === 'sent' && !isExpired) {
    await supabase
      .from('projects')
      .update({ style_guide_status: 'viewed' })
      .eq('id', params.id)
  }

  if (isExpired) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '2rem' }}>
        <div style={{ maxWidth: '500px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(129,216,208,0.1)', border: '2px solid rgba(129,216,208,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem' }}>✦</div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>This style guide has expired</h1>
          <p style={{ color: '#a1a1a1', lineHeight: 1.6 }}>Please contact <a href="mailto:media@ciarajevans.com" style={{ color: '#81D8D0' }}>media@ciarajevans.com</a> for an updated version.</p>
        </div>
      </div>
    )
  }

  return (
    <StyleGuideClient
      project={{ id: project.id, name: project.name, styleGuideHtml: project.style_guide_html }}
      alreadyAccepted={project.style_guide_status === 'accepted'}
  />
  )
}
