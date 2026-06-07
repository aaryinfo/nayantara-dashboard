import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBranches = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("branches").collect();
  },
});

export const getBranch = query({
  args: { id: v.optional(v.id("branches")) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    return await ctx.db.get(args.id);
  },
});

export const addBranch = mutation({
  args: {
    name: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can add branches");
    }

    return await ctx.db.insert("branches", {
      name: args.name,
      location: args.location,
    });
  },
});

export const updateBranch = mutation({
  args: {
    id: v.id("branches"),
    name: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can update branches");
    }

    return await ctx.db.patch(args.id, {
      name: args.name,
      location: args.location,
    });
  },
});

export const deleteBranch = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can delete branches");
    }

    // Unassign users from this branch before deleting?
    // Doing it simple for now, just delete the branch.
    return await ctx.db.delete(args.id);
  },
});
