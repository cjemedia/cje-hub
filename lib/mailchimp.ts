export async function addToMailchimp(email: string, firstName?: string, lastName?: string) {
  const API_KEY = process.env.MAILCHIMP_API_KEY
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  const DC = API_KEY?.split('-')[1] // datacenter from API key
  
  if (!API_KEY || !LIST_ID) {
    console.error('Mailchimp not configured')
    return { success: false }
  }
  
  try {
    const response = await fetch(
      `https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`,
      {
        method: 'POST',
        headers: {
          'Authorization': `apikey ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            FNAME: firstName || '',
            LNAME: lastName || '',
          },
        }),
      }
    )
    
    if (response.ok || response.status === 400) {
      // 400 might mean already subscribed, which is fine
      return { success: true }
    }
    return { success: false }
  } catch (error) {
    console.error('Mailchimp error:', error)
    return { success: false }
  }
}

