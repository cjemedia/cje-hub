import { createServiceClient } from '@/lib/supabase/service'
import InquiriesList from './InquiriesList'

// Force dynamic rendering so we always read the latest password
export const dynamic = 'force-dynamic'

export default async function MarketingInquiriesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ciarajevans.com'
  const portalUrl = `${baseUrl}/airbnb-marketing`

  // Read password from DB (with env var fallback during migration)
  let portalPassword = ''
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'airbnb_marketing_password')
      .single()
    portalPassword = data?.value || process.env.AIRBNB_MARKETING_PASSWORD || ''
  } catch {
    portalPassword = process.env.AIRBNB_MARKETING_PASSWORD || ''
  }

  return <InquiriesList portalUrl={portalUrl} portalPassword={portalPassword} />
}
