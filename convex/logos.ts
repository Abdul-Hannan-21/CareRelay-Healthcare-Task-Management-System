import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const uploadLogo = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "supervisor") {
      throw new Error("Only supervisors can upload logos");
    }

    // Deactivate current logo
    const currentLogos = await ctx.db.query("logos").collect();
    for (const logo of currentLogos) {
      await ctx.db.patch(logo._id, { isActive: false });
    }

    // Add new logo
    return await ctx.db.insert("logos", {
      storageId: args.storageId,
      uploadedBy: profile.name,
      uploadedAt: Date.now(),
      isActive: true,
    });
  },
});

export const getCurrentLogo = query({
  args: {},
  handler: async (ctx) => {
    const activeLogo = await ctx.db
      .query("logos")
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!activeLogo) {
      return null;
    }

    const url = await ctx.storage.getUrl(activeLogo.storageId);
    return {
      ...activeLogo,
      url,
    };
  },
});
