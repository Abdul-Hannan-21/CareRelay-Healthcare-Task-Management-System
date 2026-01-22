import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createUserProfile = mutation({
  args: {
    role: v.union(
      v.literal("patient"),
      v.literal("nurse"),
      v.literal("porter"),
      v.literal("supervisor")
    ),
    name: v.string(),
    bedNumber: v.optional(v.string()),
    caseNumber: v.optional(v.string()),
    staffId: v.optional(v.string()),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        role: args.role,
        name: args.name,
        bedNumber: args.bedNumber,
        caseNumber: args.caseNumber,
        staffId: args.staffId,
        department: args.department,
        lastActive: Date.now(),
      });
      return existingProfile._id;
    } else {
      // Create new profile
      return await ctx.db.insert("userProfiles", {
        userId,
        role: args.role,
        name: args.name,
        bedNumber: args.bedNumber,
        caseNumber: args.caseNumber,
        staffId: args.staffId,
        department: args.department,
        lastActive: Date.now(),
      });
    }
  },
});

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

export const updateLastActive = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, {
        lastActive: Date.now(),
      });
    }
  },
});
