'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateApplicationStatus(applicationId: string, newStatus: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Check if user is admin
    const { data: customer } = await supabase
        .from('customers')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!customer?.is_admin) {
        return { error: 'Unauthorized - Admin only' }
    }

    try {
        const { error } = await supabase
            .from('financing_applications')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', applicationId)

        if (error) {
            console.error('Error updating status:', error)
            return { error: 'Failed to update status' }
        }

        revalidatePath(`/financing/${applicationId}`)
        revalidatePath('/admin/applications')
        return { success: true }
    } catch (error: any) {
        console.error('Error:', error)
        return { error: 'Failed to update status' }
    }
}
