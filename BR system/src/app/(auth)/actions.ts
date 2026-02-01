'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const username = formData.get('username') as string
  const password = formData.get('password') as string

  console.log('Login attempt for username:', username)

  // Lookup email by username from customers table
  const { data: customer, error: lookupError } = await supabase
    .from('customers')
    .select('email')
    .eq('full_name', username.toLowerCase())
    .single()

  console.log('Customer lookup result:', { customer, lookupError })

  if (lookupError || !customer) {
    console.log('Customer not found or error:', lookupError)
    return { error: 'Invalid username or password' }
  }

  // Login with the found email
  const { error } = await supabase.auth.signInWithPassword({
    email: customer.email,
    password,
  })

  console.log('Auth result:', { error })

  if (error) {
    return { error: 'Invalid username or password' }
  }

  return { success: true }
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const username = formData.get('username') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Check if username already taken
  const { data: existingUser } = await supabase
    .from('customers')
    .select('id')
    .eq('full_name', username.toLowerCase())
    .single()

  if (existingUser) {
    return { error: 'Username already taken' }
  }

  // Register with Supabase Auth using real email
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username.toLowerCase(),
      },
    },
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { error: 'Email already registered' }
    }
    return { error: authError.message }
  }

  // Create customer record directly using admin client (bypasses RLS)
  // No longer relying on database trigger
  if (authData.user) {
    const adminClient = createAdminClient()

    const { error: customerError } = await adminClient
      .from('customers')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: username.toLowerCase(),
        created_at: new Date().toISOString(),
      })

    if (customerError) {
      console.error('Failed to create customer record:', customerError)
      // Don't fail registration, but log the error
      // User can still be created in customers table later if needed
    }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
