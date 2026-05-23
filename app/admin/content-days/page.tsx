import InquiriesList from './InquiriesList'

export const dynamic = 'force-dynamic'

export default async function ContentDaysAdminPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ciarajevans.com'
  const portalUrl = `${baseUrl}/content-days`
  return <InquiriesList portalUrl={portalUrl} />
}
