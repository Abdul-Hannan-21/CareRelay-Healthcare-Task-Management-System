import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  logos: defineTable({
    storageId: v.id("_storage"),
    uploadedBy: v.string(),
    uploadedAt: v.number(),
    isActive: v.boolean(),
  }),

  tasks: defineTable({
    // Task identification
    taskId: v.string(),
    
    // Task details
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
    status: v.union(
      v.literal("new"),
      v.literal("accepted"),
      v.literal("in_progress"),
      v.literal("done")
    ),
    
    // Patient information
    bedNumber: v.string(),
    patientName: v.string(),
    caseNumber: v.optional(v.string()),
    
    // Task content
    description: v.string(),
    notes: v.optional(v.string()),
    location: v.optional(v.string()),
    
    // Assignment
    createdBy: v.string(), // user role who created it
    createdByName: v.string(),
    assignedTo: v.optional(v.string()), // staff member assigned
    assignedToName: v.optional(v.string()),
    
    // Timestamps
    acceptedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_priority", ["priority"])
    .index("by_bed", ["bedNumber"])
    .index("by_created_by", ["createdBy"])
    .index("by_assigned_to", ["assignedTo"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.union(
      v.literal("patient"),
      v.literal("nurse"),
      v.literal("porter"),
      v.literal("supervisor")
    ),
    name: v.string(),
    
    // Patient-specific fields
    bedNumber: v.optional(v.string()),
    caseNumber: v.optional(v.string()),
    
    // Staff-specific fields
    staffId: v.optional(v.string()),
    department: v.optional(v.string()),
    
    // Session management
    lastActive: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_role", ["role"])
    .index("by_bed_number", ["bedNumber"])
    .index("by_case_number", ["caseNumber"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
