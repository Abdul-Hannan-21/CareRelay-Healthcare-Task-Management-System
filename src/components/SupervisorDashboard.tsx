import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function SupervisorDashboard() {
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const tasks = useQuery(api.tasks.getTasksForRole);
  const analytics = useQuery(api.tasks.getTaskAnalytics);
  const assignTask = useMutation(api.tasks.assignTask);
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const deleteTask = useMutation(api.tasks.deleteTask);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchBed, setSearchBed] = useState("");
  const [assigningTask, setAssigningTask] = useState<string | null>(null);
  const [assignToName, setAssignToName] = useState("");

  const handleAssignTask = async (taskId: string) => {
    if (!assignToName.trim()) return;
    
    try {
      await assignTask({ taskId: taskId as any, assignedTo: assignToName.trim() });
      toast.success("Task assigned successfully!");
      setAssigningTask(null);
      setAssignToName("");
    } catch (error) {
      toast.error("Failed to assign task");
    }
  };

  const handleUpdateStatus = async (taskId: string, status: "accepted" | "in_progress" | "done") => {
    try {
      await updateTaskStatus({ taskId: taskId as any, status });
      toast.success("Task status updated!");
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await deleteTask({ taskId: taskId as any });
      toast.success("Task deleted!");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800 border-green-200";
      case "medium": return "bg-green-200 text-green-900 border-green-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "accepted": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-purple-100 text-purple-800";
      case "done": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "patient": return "bg-red-100 text-red-800";
      case "nurse": return "bg-blue-100 text-blue-800";
      case "porter": return "bg-purple-100 text-purple-800";
      case "supervisor": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Filter tasks
  const filteredTasks = tasks?.filter(task => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    if (filterType !== "all" && task.type !== filterType) return false;
    if (searchBed && !task.bedNumber.toLowerCase().includes(searchBed.toLowerCase())) return false;
    return true;
  }) || [];

  const activeTasks = filteredTasks.filter(task => task.status !== "done");
  const completedTasks = filteredTasks.filter(task => task.status === "done");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Supervisor Dashboard</h1>
            <p className="text-gray-600">
              Welcome, {userProfile?.name} • Hospital-wide Overview
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">{analytics.totalTasks}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-orange-600">{analytics.activeTasks}</div>
            <div className="text-sm text-gray-600">Active Tasks</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">{analytics.completedTasks}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-red-600">{analytics.urgentTasks}</div>
            <div className="text-sm text-gray-600">Urgent Active</div>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">By Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New</span>
                <span className="font-medium text-blue-600">{analytics.statusCounts.new}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accepted</span>
                <span className="font-medium text-yellow-600">{analytics.statusCounts.accepted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="font-medium text-purple-600">{analytics.statusCounts.in_progress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Done</span>
                <span className="font-medium text-green-600">{analytics.statusCounts.done}</span>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">By Priority</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low</span>
                <span className="font-medium text-green-600">{analytics.priorityCounts.low}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Medium</span>
                <span className="font-medium text-green-700">{analytics.priorityCounts.medium}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">High</span>
                <span className="font-medium text-orange-600">{analytics.priorityCounts.high}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Urgent</span>
                <span className="font-medium text-red-600">{analytics.priorityCounts.urgent}</span>
              </div>
            </div>
          </div>

          {/* Type Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">By Type</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nursing</span>
                <span className="font-medium">{analytics.typeCounts.nursing}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transport</span>
                <span className="font-medium">{analytics.typeCounts.transport}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Meal</span>
                <span className="font-medium">{analytics.typeCounts.meal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Equipment</span>
                <span className="font-medium">{analytics.typeCounts.equipment}</span>
              </div>
            </div>
          </div>

          {/* Role Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">By Creator</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Patient</span>
                <span className="font-medium text-red-600">{analytics.roleCounts.patient}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nurse</span>
                <span className="font-medium text-blue-600">{analytics.roleCounts.nurse}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Porter</span>
                <span className="font-medium text-purple-600">{analytics.roleCounts.porter}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Supervisor</span>
                <span className="font-medium text-green-600">{analytics.roleCounts.supervisor}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Types</option>
              <option value="nursing">Nursing</option>
              <option value="transport">Transport</option>
              <option value="meal">Meal</option>
              <option value="cleaning">Cleaning</option>
              <option value="interpreter">Interpreter</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Bed Number</label>
            <input
              type="text"
              value={searchBed}
              onChange={(e) => setSearchBed(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Search bed..."
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterStatus("all");
                setFilterPriority("all");
                setFilterType("all");
                setSearchBed("");
              }}
              className="w-full px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Active Tasks ({activeTasks.length})
        </h2>
        
        {activeTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active tasks match your filters</p>
        ) : (
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <div key={task._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-blue-600">Bed {task.bedNumber}</span>
                      <span className="font-medium text-gray-800">{task.patientName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace("_", " ").toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(task.createdBy)}`}>
                        {task.createdBy.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-2">{task.description}</p>
                    {task.location && (
                      <p className="text-sm text-gray-600 mb-2">📍 {task.location}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Created by: {task.createdByName}</span>
                      {task.assignedToName && (
                        <span>Assigned to: {task.assignedToName}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(task._creationTime).toLocaleString()}</p>
                    <p className="text-xs">#{task.taskId}</p>
                  </div>
                </div>

                {/* Assignment Section */}
                {assigningTask === task._id ? (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={assignToName}
                      onChange={(e) => setAssignToName(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Enter staff name..."
                    />
                    <button
                      onClick={() => handleAssignTask(task._id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => {
                        setAssigningTask(null);
                        setAssignToName("");
                      }}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => {
                        setAssigningTask(task._id);
                        setAssignToName(task.assignedToName || "");
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      {task.assignedToName ? "Reassign" : "Assign"}
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {task.status === "new" && (
                    <button
                      onClick={() => handleUpdateStatus(task._id, "accepted")}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                    >
                      Mark Accepted
                    </button>
                  )}
                  
                  {task.status === "accepted" && (
                    <button
                      onClick={() => handleUpdateStatus(task._id, "in_progress")}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                    >
                      Mark In Progress
                    </button>
                  )}
                  
                  {task.status === "in_progress" && (
                    <button
                      onClick={() => handleUpdateStatus(task._id, "done")}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Mark Complete
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Completed Tasks ({completedTasks.length})
          </h2>
          
          <div className="space-y-3">
            {completedTasks.slice(0, 20).map((task) => (
              <div key={task._id} className="border border-gray-200 rounded-lg p-4 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-blue-600">Bed {task.bedNumber}</span>
                      <span className="font-medium text-gray-800">{task.patientName}</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        COMPLETED ✓
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(task.createdBy)}`}>
                        {task.createdBy.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-800">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Created by: {task.createdByName}</span>
                      {task.assignedToName && (
                        <span>Completed by: {task.assignedToName}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{task.completedAt ? new Date(task.completedAt).toLocaleString() : "Recently"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
