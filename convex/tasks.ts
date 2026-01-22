import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper function to get user profile
async function getUserProfile(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .unique();

  if (!profile) {
    throw new Error("User profile not found");
  }

  return profile;
}

export const createTask = mutation({
  args: {
    type: v.union(
      v.literal("transport"),
      v.literal("meal"),
      v.literal("cleaning"),
      v.literal("interpreter"),
      v.literal("equipment"),
      v.literal("nursing")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    bedNumber: v.string(),
    patientName: v.string(),
    description: v.string(),
    location: v.optional(v.string()),
    caseNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await getUserProfile(ctx);
    
    const taskId = `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return await ctx.db.insert("tasks", {
      taskId,
      type: args.type,
      priority: args.priority,
      status: "new",
      bedNumber: args.bedNumber,
      patientName: args.patientName,
      description: args.description,
      location: args.location,
      caseNumber: args.caseNumber,
      createdBy: profile.role,
      createdByName: profile.name,
    });
  },
});

export const getTasksForRole = query({
  args: {},
  handler: async (ctx) => {
    const profile = await getUserProfile(ctx);

    if (profile.role === "patient") {
      // Patients only see their own tasks
      return await ctx.db
        .query("tasks")
        .withIndex("by_bed", (q) => q.eq("bedNumber", profile.bedNumber || ""))
        .filter((q) => q.eq(q.field("caseNumber"), profile.caseNumber))
        .order("desc")
        .collect();
    } else if (profile.role === "nurse") {
      // Nurses see tasks they created
      return await ctx.db
        .query("tasks")
        .withIndex("by_created_by", (q) => q.eq("createdBy", "nurse"))
        .order("desc")
        .collect();
    } else if (profile.role === "porter") {
      // Porters see available porter tasks and their assigned tasks
      const availableTasks = await ctx.db
        .query("tasks")
        .filter((q) => 
          q.and(
            q.or(
              q.eq(q.field("type"), "transport"),
              q.eq(q.field("type"), "equipment"),
              q.eq(q.field("type"), "cleaning"),
              q.eq(q.field("type"), "meal")
            ),
            q.or(
              q.eq(q.field("status"), "new"),
              q.eq(q.field("assignedTo"), profile.name)
            )
          )
        )
        .order("desc")
        .collect();
      return availableTasks;
    } else if (profile.role === "supervisor") {
      // Supervisors see all tasks
      return await ctx.db
        .query("tasks")
        .order("desc")
        .collect();
    }

    return [];
  },
});

export const acceptTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const profile = await getUserProfile(ctx);
    
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.status !== "new") {
      throw new Error("Task is not available");
    }

    await ctx.db.patch(args.taskId, {
      status: "accepted",
      assignedTo: profile.name,
      assignedToName: profile.name,
      acceptedAt: Date.now(),
    });
  },
});

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("accepted"),
      v.literal("in_progress"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    const profile = await getUserProfile(ctx);
    
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check permissions
    if (profile.role !== "supervisor" && task.assignedTo !== profile.name && task.createdBy !== profile.role) {
      throw new Error("Not authorized to update this task");
    }

    const updateData: any = { status: args.status };

    if (args.status === "in_progress" && !task.startedAt) {
      updateData.startedAt = Date.now();
    } else if (args.status === "done" && !task.completedAt) {
      updateData.completedAt = Date.now();
    }

    await ctx.db.patch(args.taskId, updateData);
  },
});

export const updateTaskNotes = mutation({
  args: {
    taskId: v.id("tasks"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await getUserProfile(ctx);
    
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check permissions
    if (profile.role !== "supervisor" && task.assignedTo !== profile.name && task.createdBy !== profile.role) {
      throw new Error("Not authorized to update this task");
    }

    await ctx.db.patch(args.taskId, {
      notes: args.notes,
    });
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const profile = await getUserProfile(ctx);
    
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Only supervisors or task creators can delete
    if (profile.role !== "supervisor" && task.createdBy !== profile.role) {
      throw new Error("Not authorized to delete this task");
    }

    await ctx.db.delete(args.taskId);
  },
});

export const getTaskAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const profile = await getUserProfile(ctx);
    
    if (profile.role !== "supervisor") {
      throw new Error("Only supervisors can access analytics");
    }

    const allTasks = await ctx.db.query("tasks").collect();
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const recentTasks = allTasks.filter(task => task._creationTime > sevenDaysAgo);
    
    // Status distribution
    const statusCounts = {
      new: allTasks.filter(t => t.status === "new").length,
      accepted: allTasks.filter(t => t.status === "accepted").length,
      in_progress: allTasks.filter(t => t.status === "in_progress").length,
      done: allTasks.filter(t => t.status === "done").length,
    };

    // Priority distribution
    const priorityCounts = {
      low: allTasks.filter(t => t.priority === "low").length,
      medium: allTasks.filter(t => t.priority === "medium").length,
      high: allTasks.filter(t => t.priority === "high").length,
      urgent: allTasks.filter(t => t.priority === "urgent").length,
    };

    // Type distribution
    const typeCounts = {
      transport: allTasks.filter(t => t.type === "transport").length,
      meal: allTasks.filter(t => t.type === "meal").length,
      cleaning: allTasks.filter(t => t.type === "cleaning").length,
      interpreter: allTasks.filter(t => t.type === "interpreter").length,
      equipment: allTasks.filter(t => t.type === "equipment").length,
      nursing: allTasks.filter(t => t.type === "nursing").length,
    };

    // Role distribution
    const roleCounts = {
      patient: allTasks.filter(t => t.createdBy === "patient").length,
      nurse: allTasks.filter(t => t.createdBy === "nurse").length,
      porter: allTasks.filter(t => t.createdBy === "porter").length,
      supervisor: allTasks.filter(t => t.createdBy === "supervisor").length,
    };

    return {
      totalTasks: allTasks.length,
      activeTasks: allTasks.filter(t => t.status !== "done").length,
      completedTasks: allTasks.filter(t => t.status === "done").length,
      urgentTasks: allTasks.filter(t => t.priority === "urgent" && t.status !== "done").length,
      recentTasksCount: recentTasks.length,
      statusCounts,
      priorityCounts,
      typeCounts,
      roleCounts,
    };
  },
});

export const assignTask = mutation({
  args: {
    taskId: v.id("tasks"),
    assignedTo: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await getUserProfile(ctx);
    
    if (profile.role !== "supervisor") {
      throw new Error("Only supervisors can assign tasks");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    await ctx.db.patch(args.taskId, {
      assignedTo: args.assignedTo,
      assignedToName: args.assignedTo,
      status: task.status === "new" ? "accepted" : task.status,
      acceptedAt: task.acceptedAt || Date.now(),
    });
  },
});
