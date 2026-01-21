import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        if (!supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Service role key not configured' },
                { status: 500 }
            )
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // Apply the DELETE policy using raw SQL
        const { error } = await supabase.rpc('exec_sql', {
            query: `
        CREATE POLICY IF NOT EXISTS "Users can delete their own financing applications"
          ON financing_applications FOR DELETE
          TO authenticated
          USING (customer_id = auth.uid());
      `
        })

        if (error) {
            // Try alternative approach - check if we can delete (this will fail but give us info)
            console.error('RPC error:', error)

            return NextResponse.json({
                success: false,
                error: error.message,
                instruction: 'Please run this SQL in Supabase SQL Editor',
                sql: `CREATE POLICY "Users can delete their own financing applications"
  ON financing_applications FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());`
            })
        }

        return NextResponse.json({
            success: true,
            message: 'DELETE policy applied successfully'
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
