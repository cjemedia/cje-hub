import HubHeader from '@/components/HubHeader'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

async function getContactMessages() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to load contact messages', error)
    return []
  }

  return data || []
}

export default async function InquiriesPage() {
  const messages = await getContactMessages()

  return (
    <main className="min-h-screen bg-primary-white">
      <HubHeader title="Contact Responses" subtitle="Messages submitted from public forms" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-serif font-bold text-primary-black mb-2">
            Contact Form Responses
          </h1>
          <p className="text-primary-charcoal/70">
            View messages submitted through the website contact form.
          </p>
        </div>

        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="border-2 border-primary-charcoal/10 rounded-2xl p-10 text-center text-primary-charcoal/70">
              No messages yet.
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className="border-2 border-primary-charcoal/10 rounded-2xl p-6 bg-white space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary-charcoal">
                    {message.sender_email}
                  </p>
                  {message.phone && (
                    <p className="text-sm text-primary-charcoal/70">{message.phone}</p>
                  )}
                </div>
                <p className="text-sm text-primary-charcoal/60">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
              {message.subject && (
                <p className="text-sm font-semibold text-primary-charcoal/80">
                  Subject: {message.subject}
                </p>
              )}
              {message.inquiry_types && message.inquiry_types.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {message.inquiry_types.map((type: string) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-primary-tiffany/15 text-primary-tiffany rounded-full text-xs font-semibold"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-primary-charcoal/80 whitespace-pre-wrap">{message.message}</p>
              <p className="text-sm text-primary-charcoal/60">
                Preferred contact: {message.preferred_contact || 'Not specified'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

