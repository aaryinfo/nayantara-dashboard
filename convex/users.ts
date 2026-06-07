import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const isAdmin = identity.email === "aaryinfo@gmail.com";

    if (user !== null) {
      const patches: any = {};
      if (user.fullName !== identity.name) {
        patches.fullName = identity.name;
      }
      
      // Auto-fix admin if they were previously created as pending/operator
      if (isAdmin && (user.role !== "admin" || user.status !== "approved")) {
        patches.role = "admin";
        patches.status = "approved";
      }

      if (Object.keys(patches).length > 0) {
        await ctx.db.patch(user._id, patches);
      }
      return user._id;
    }

    // If it's a new identity, create a new User.
    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email!,
      role: isAdmin ? "admin" : "operator", 
      status: isAdmin ? "approved" : "pending", 
      fullName: identity.name,
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") return [];

    return await ctx.db.query("users").collect();
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("operator")),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    branchId: v.optional(v.id("branches")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || caller.role !== "admin") throw new Error("Unauthorized");

    // Prevent changing your own role or status
    if (caller._id === args.userId) {
      await ctx.db.patch(args.userId, { branchId: args.branchId });
      return;
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
      status: args.status,
      branchId: args.branchId,
    });
  },
});
