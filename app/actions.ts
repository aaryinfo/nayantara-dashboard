'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { fetchMutation } from "convex/nextjs"
import { api } from "@/convex/_generated/api"

export async function addTransaction(formData: FormData) {
  const { getToken } = await auth()
  const token = await getToken({ template: "convex" })
  if (!token) throw new Error('Not authenticated')

  const amount = parseFloat(formData.get('amount') as string)
  const type = formData.get('type') as 'in' | 'out'
  const date = formData.get('date') as string
  const sourceCategory = formData.get('source') as string
  const paymentMode = formData.get('mode') as string
  const description = formData.get('description') as string
  const notes = formData.get('notes') as string

  try {
    await fetchMutation(api.transactions.addTransaction, {
      type,
      amount,
      sourceCategory,
      paymentMode,
      description,
      notes: notes || undefined,
      date
    }, { token })
  } catch (error: any) {
    console.error('Error adding transaction:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/ledger')
  return { success: true }
}

export async function addBranch(formData: FormData) {
  const { getToken } = await auth()
  const token = await getToken({ template: "convex" })
  if (!token) throw new Error('Not authenticated')

  // We haven't implemented addBranch in Convex yet, just returning success for now
  // TODO: Implement branches mutation in Convex
  revalidatePath('/admin/branches')
  return { success: true }
}

export async function updateUserStatus(formData: FormData) {
  const { getToken } = await auth()
  const token = await getToken({ template: "convex" })
  if (!token) throw new Error('Not authenticated')

  // We haven't implemented updateUserStatus in Convex yet
  // TODO: Implement users mutation in Convex
  revalidatePath('/admin/users')
  return { success: true }
}
