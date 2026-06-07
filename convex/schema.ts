import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  branches: defineTable({
    name: v.string(),
    location: v.optional(v.string()),
  }),
  
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("operator")),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    branchId: v.optional(v.id("branches")),
    fullName: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),
  
  transactions: defineTable({
    branchId: v.optional(v.id("branches")),
    createdBy: v.id("users"),
    date: v.string(),
    type: v.union(v.literal("in"), v.literal("out")),
    amount: v.number(),
    sourceCategory: v.string(),
    paymentMode: v.string(),
    description: v.string(),
    notes: v.optional(v.string()),
  }).index("by_branch", ["branchId"]),
  
  budgets: defineTable({
    branchId: v.optional(v.id("branches")),
    category: v.string(),
    amount: v.number(),
    month: v.string(), // Format: YYYY-MM
  }).index("by_branch_and_month", ["branchId", "month"]),
});
