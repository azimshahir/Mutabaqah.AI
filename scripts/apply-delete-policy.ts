import { createClient } from '@supabase/supabase-js'

// This script applies the DELETE policy for financing_applications table
async function applyDeletePolicy() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
        console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables')
        console.log('Please add it to your .env.local file')
        process.exit(1)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    console.log('🔄 Applying DELETE policy migration...')

    const { error } = await supabase.rpc('exec_sql', {
        sql: `
      CREATE POLICY IF NOT EXISTS "Users can delete their own financing applications"
        ON financing_applications FOR DELETE
        TO authenticated
        USING (customer_id = auth.uid());
    `
    })

    if (error) {
        console.error('❌ Error applying migration:', error.message)

        // Try alternative method using direct SQL
        console.log('🔄 Trying alternative method...')

        const { error: altError } = await supabase.from('financing_applications').delete().eq('id', '00000000-0000-0000-0000-000000000000')

        if (altError && altError.message.includes('policy')) {
            console.error('❌ DELETE policy is missing. Please run this SQL in Supabase SQL Editor:')
            console.log(`
CREATE POLICY "Users can delete their own financing applications"
  ON financing_applications FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());
      `)
        }

        process.exit(1)
    }

    console.log('✅ DELETE policy applied successfully!')
    console.log('You can now test the withdraw button.')
}

applyDeletePolicy()
