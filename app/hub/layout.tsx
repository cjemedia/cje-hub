// Hub layout - authentication is handled by middleware
export default function HubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

