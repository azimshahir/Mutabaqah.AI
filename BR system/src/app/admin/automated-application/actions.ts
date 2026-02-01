'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Fake data generators
const firstNames = ['Ahmad', 'Ali', 'Siti', 'Fatimah', 'Muhammad', 'Nurul', 'Hassan', 'Aminah', 'Ibrahim', 'Zainab']
const lastNames = ['Abdullah', 'Rahman', 'Hassan', 'Ahmad', 'Ali', 'Ismail', 'Omar', 'Yusof', 'Ibrahim', 'Mahmud']
const productTypes = ['personal_financing_i', 'home_financing_i', 'vehicle_financing_i', 'business_financing_i']
const statuses = ['pending', 'approved', 'rejected', 'disbursed']

function generateRandomIC() {
    const year = Math.floor(Math.random() * 30) + 70 // 70-99
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
    const state = String(Math.floor(Math.random() * 14) + 1).padStart(2, '0')
    const num = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')
    return `${year}${month}${day}-${state}-${num}`
}

function generateRandomPhone() {
    const prefix = ['012', '013', '014', '016', '017', '018', '019']
    const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)]
    const num = String(Math.floor(Math.random() * 10000000)).padStart(7, '0')
    return `${randomPrefix}-${num.substring(0, 3)}${num.substring(3)}`
}

function generateRandomEmail(name: string) {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    const domain = domains[Math.floor(Math.random() * domains.length)]
    return `${name.toLowerCase().replace(' ', '.')}${Math.floor(Math.random() * 999)}@${domain}`
}

export async function generateAutomatedApplications(formData: FormData) {
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

    const amount = parseInt(formData.get('amount') as string)
    const status = formData.get('status') as string

    if (isNaN(amount) || amount < 1 || amount > 1000) {
        return { error: 'Amount must be between 1 and 1000' }
    }

    if (!statuses.includes(status)) {
        return { error: 'Invalid status' }
    }

    try {
        const applications = []

        for (let i = 0; i < amount; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
            const fullName = `${firstName} bin ${lastName}`
            const ic = generateRandomIC()
            const phone = generateRandomPhone()
            const email = generateRandomEmail(fullName)
            const productType = productTypes[Math.floor(Math.random() * productTypes.length)]
            const principalAmount = Math.floor(Math.random() * 200000) + 10000 // 10k - 210k
            const tenureMonths = [12, 24, 36, 48, 60, 84, 120][Math.floor(Math.random() * 7)]
            const monthlyIncome = Math.floor(Math.random() * 15000) + 3000 // 3k - 18k

            applications.push({
                application_number: `AUTO-${Date.now()}-${i}`,
                customer_id: user.id, // Use admin's ID for automated apps
                product_type: productType,
                principal_amount: principalAmount,
                profit_rate: 0.05,
                tenure_months: tenureMonths,
                status: status,
                applicant_name: fullName,
                applicant_ic: ic,
                applicant_phone: phone,
                applicant_email: email,
                applicant_address: `No. ${Math.floor(Math.random() * 999) + 1}, Jalan ${lastName}, ${Math.floor(Math.random() * 99999) + 10000} Kuala Lumpur`,
                applicant_occupation: ['Engineer', 'Teacher', 'Doctor', 'Manager', 'Accountant'][Math.floor(Math.random() * 5)],
                applicant_employer: `${lastName} ${['Sdn Bhd', 'Bhd', 'Corporation', 'Group'][Math.floor(Math.random() * 4)]}`,
                applicant_monthly_income: monthlyIncome,
            })
        }

        // Insert in batches of 100 to avoid timeout
        const batchSize = 100
        for (let i = 0; i < applications.length; i += batchSize) {
            const batch = applications.slice(i, i + batchSize)
            const { error } = await supabase
                .from('financing_applications')
                .insert(batch)

            if (error) {
                console.error('Error inserting batch:', error)
                return { error: `Failed to insert applications: ${error.message}` }
            }
        }

        revalidatePath('/admin/applications')
        return { success: true, count: amount }
    } catch (error: any) {
        console.error('Error generating applications:', error)
        return { error: 'Failed to generate applications' }
    }
}

export async function deleteAllApplications() {
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
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

        if (error) {
            console.error('Error deleting applications:', error)
            return { error: 'Failed to delete applications' }
        }

        revalidatePath('/admin/applications')
        return { success: true }
    } catch (error: any) {
        console.error('Error:', error)
        return { error: 'Failed to delete applications' }
    }
}

export async function deleteSelectedApplications(applicationIds: string[]) {
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
            .delete()
            .in('id', applicationIds)

        if (error) {
            console.error('Error deleting applications:', error)
            return { error: 'Failed to delete applications' }
        }

        revalidatePath('/admin/applications')
        return { success: true, count: applicationIds.length }
    } catch (error: any) {
        console.error('Error:', error)
        return { error: 'Failed to delete applications' }
    }
}
