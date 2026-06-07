'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Existing actions...
export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('branch_id, role, status')
    .eq('id', user.id)
    .single()

  if (profile?.status !== 'approved') {
    throw new Error('User not approved')
  }

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

// NEW ACTIONS
export async function updateUserStatus(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const targetUserId = formData.get('userId') as string
  const status = formData.get('status') as string
  const branchId = formData.get('branchId') as string
  const role = formData.get('role') as string

  const updateData: any = { status, role }
  if (branchId && branchId !== 'none') {
    updateData.branch_id = branchId
  } else if (branchId === 'none') {
    updateData.branch_id = null
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', targetUserId)

  if (error) {
    console.error('Error updating user:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
