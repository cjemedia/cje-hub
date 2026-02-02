import { SupabaseClient } from '@supabase/supabase-js'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Get all project IDs assigned to a user via the project_clients junction table.
 * Falls back to checking projects.user_id for backward compatibility.
 * Returns a list of project IDs the user has access to.
 */
export async function getUserProjectIds(supabase: SupabaseClient, userId: string): Promise<string[]> {
  // Get projects from junction table
  const { data: junctionProjects } = await supabase
    .from('project_clients')
    .select('project_id')
    .eq('user_id', userId)

  const junctionIds = junctionProjects?.map(p => p.project_id) || []

  // Get legacy projects (where user_id is directly on the project)
  const { data: legacyProjects } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', userId)

  const legacyIds = legacyProjects?.map(p => p.id) || []

  // Combine and deduplicate
  return [...new Set([...junctionIds, ...legacyIds])]
}
