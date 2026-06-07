'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get user's branch
  const { data: profile } = await supabase
    .from('profiles')
    .select('branch_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.branch_id && profile?.role !== 'admin') {
    throw new Error('User has no assigned branch')
  }

  // Admins can potentially select a branch, but for now we'll assume they need one assigned or passed in
  // Let's get the branch_id from the form if provided (admin override), otherwise use profile branch
  const formBranchId = formData.get('branch_id') as string
  const finalBranchId = profile.role === 'admin' && formBranchId ? formBranchId : profile.branch_id

  if (!finalBranchId) throw new Error('Branch ID is required')

  const amount = parseFloat(formData.get('amount') as string)
  const type = formData.get('type') as string // 'in' or 'out'
  const date = formData.get('date') as string
  const source_category = formData.get('source') as string
  const payment_mode = formData.get('mode') as string
  const description = formData.get('description') as string
  const notes = formData.get('notes') as string

  const { error } = await supabase
    .from('transactions')
    .insert({
      branch_id: finalBranchId,
      created_by: user.id,
      date,
      type,
      amount,
      source_category,
      payment_mode,
      description,
      notes: notes || null
    })

  if (error) {
    console.error('Error adding transaction:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/ledger')
  return { success: true }
}

export async function addBranch(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized. Admins only.')
  }

  const name = formData.get('name') as string
  const location = formData.get('location') as string

  const { error } = await supabase
    .from('branches')
    .insert({
      name,
      location: location || null
    })

  if (error) {
    console.error('Error adding branch:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/branches')
  return { success: true }
}
