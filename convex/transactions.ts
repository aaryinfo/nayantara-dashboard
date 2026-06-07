import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getTransactions = query({
  args: {
    branchId: v.optional(v.id("branches")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    // Admins get everything if no branchId passed
    if (user.role === "admin" && !args.branchId) {
      return await ctx.db.query("transactions").order("desc").collect();
    }

    // Otherwise restrict to their branch
    const effectiveBranch = args.branchId || user.branchId;
    if (!effectiveBranch) return [];

    return await ctx.db
      .query("transactions")
      .withIndex("by_branch", (q) => q.eq("branchId", effectiveBranch))
      .order("desc")
      .collect();
  },
});

export const addTransaction = mutation({
  args: {
    type: v.union(v.literal("in"), v.literal("out")),
    amount: v.number(),
    sourceCategory: v.string(),
    paymentMode: v.string(),
    description: v.string(),
    notes: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || (!user.branchId && user.role !== "admin")) {
      throw new Error("No branch assigned");
    }

    const transactionData: any = {
      ...args,
      createdBy: user._id,
    };
    
    if (user.branchId) {
      transactionData.branchId = user.branchId;
    }

    return await ctx.db.insert("transactions", transactionData);
  },
});

export const bulkAddTransactions = mutation({
  args: {
    transactions: v.array(
      v.object({
        type: v.union(v.literal("in"), v.literal("out")),
        amount: v.number(),
        sourceCategory: v.string(),
        paymentMode: v.string(),
        description: v.string(),
        notes: v.optional(v.string()),
        date: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || (!user.branchId && user.role !== "admin")) {
      throw new Error("No branch assigned");
    }

    const branchId = user.branchId;

    const ids = [];
    for (const tx of args.transactions) {
      const transactionData: any = {
        ...tx,
        createdBy: user._id,
      };
      if (branchId) {
        transactionData.branchId = branchId;
      }
      const id = await ctx.db.insert("transactions", transactionData);
      ids.push(id);
    }
    return ids;
  },
});

export const updateTransaction = mutation({
  args: {
    id: v.id("transactions"),
    type: v.union(v.literal("in"), v.literal("out")),
    amount: v.number(),
    sourceCategory: v.string(),
    paymentMode: v.string(),
    description: v.string(),
    notes: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const tx = await ctx.db.get(args.id);
    if (!tx) throw new Error("Transaction not found");

    if (user.role !== "admin" && tx.branchId !== user.branchId) {
      throw new Error("Unauthorized: Cannot edit transactions from other branches");
    }

    const { id, ...updateFields } = args;
    return await ctx.db.patch(id, updateFields);
  },
});

export const deleteTransaction = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const tx = await ctx.db.get(args.id);
    if (!tx) throw new Error("Transaction not found");

    if (user.role !== "admin" && tx.branchId !== user.branchId) {
      throw new Error("Unauthorized: Cannot delete transactions from other branches");
    }

    return await ctx.db.delete(args.id);
  },
});
