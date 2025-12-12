import { createServiceClient } from '@/lib/supabase/service'

export async function logProjectActivity(projectId: string, userId: string | null, action: string, details: Record<string, any> = {}) {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('project_activity').insert({
      project_id: projectId,
      user_id: userId,
      action,
      details,
    })

    if (error) {
      console.error('Error logging project activity:', error)
    }
  } catch (error) {
    console.error('Unexpected error logging project activity:', error)
  }
}

