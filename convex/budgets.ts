import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBudgets = query({
  args: { 
    branchId: v.optional(v.id("branches")),
    month: v.string() // Format: YYYY-MM
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to getBudgets");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const effectiveBranchId = args.branchId || user.branchId;
    if (!effectiveBranchId) return []; // Cannot fetch budgets if no branch

    return await ctx.db
      .query("budgets")
      .withIndex("by_branch_and_month", (q) => 
        q.eq("branchId", effectiveBranchId).eq("month", args.month)
      )
      .collect();
  },
});

export const setBudget = mutation({
  args: {
    branchId: v.optional(v.id("branches")),
    category: v.string(),
    amount: v.number(),
    month: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to setBudget");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const effectiveBranchId = args.branchId || user.branchId;
    // Admins without a branch can set global/null branch budgets if we allow, but let's stick to branch level.
    if (!effectiveBranchId && user.role !== "admin") throw new Error("No branch assigned");

    // Check if an existing budget is set for this category and month
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_branch_and_month", (q) => 
        q.eq("branchId", effectiveBranchId).eq("month", args.month)
      )
      .filter((q) => q.eq(q.field("category"), args.category))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { amount: args.amount });
    } else {
      await ctx.db.insert("budgets", {
        branchId: effectiveBranchId,
        category: args.category,
        amount: args.amount,
        month: args.month,
      });
    }
  },
});
