const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function applyDeletePolicy() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseServiceKey) {
        console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found')
        process.exit(1)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    console.log('🔄 Applying DELETE policy migration...')

    // Apply the DELETE policy
    const { data, error } = await supabase.rpc('exec_sql', {
        query: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = 'financing_applications' 
          AND policyname = 'Users can delete their own financing applications'
        ) THEN
          CREATE POLICY "Users can delete their own financing applications"
            ON financing_applications FOR DELETE
            TO authenticated
            USING (customer_id = auth.uid());
          
          RAISE NOTICE 'Policy created successfully';
        ELSE
          RAISE NOTICE 'Policy already exists';
        END IF;
      END $$;
    `
    })

    if (error) {
        console.error('❌ Error:', error.message)
        console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:')
        console.log(`
CREATE POLICY "Users can delete their own financing applications"
  ON financing_applications FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());
    `)
        process.exit(1)
    }

    console.log('✅ Migration applied successfully!')
    console.log('You can now test the withdraw button.')
}

applyDeletePolicy()
