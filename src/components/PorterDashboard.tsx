import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function PorterDashboard() {
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const tasks = useQuery(api.tasks.getTasksForRole);
  const acceptTask = useMutation(api.tasks.acceptTask);
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);

  const handleAcceptTask = async (taskId: string) => {
    try {
      await acceptTask({ taskId: taskId as any });
      toast.success("Task accepted!");
    } catch (error) {
      toast.error("Failed to accept task");
    }
  };

  const handleUpdateStatus = async (taskId: string, status: "in_progress" | "done") => {
    try {
      await updateTaskStatus({ taskId: taskId as any, status });
      toast.success("Task status updated!");
    } catch (error) {
      toast.error("Failed to update task status");
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

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "transport": return "🚚";
      case "equipment": return "🔧";
      case "cleaning": return "🧹";
      case "meal": return "🍽️";
      default: return "📋";
    }
  };

  const availableTasks = tasks?.filter(task => 
    task.status === "new" && 
    ["transport", "equipment", "cleaning", "meal"].includes(task.type)
  ) || [];
  
  const myTasks = tasks?.filter(task => task.assignedToName === userProfile?.name) || [];
  const activeTasks = myTasks.filter(task => task.status !== "done");
  const completedTasks = myTasks.filter(task => task.status === "done");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Porter Dashboard</h1>
            <p className="text-gray-600">
              Welcome, {userProfile?.name} • {userProfile?.department || "General Services"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{availableTasks.length}</div>
            <div className="text-sm text-gray-600">Available Tasks</div>
          </div>
        </div>
      </div>

      {/* Available Tasks */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Available Tasks ({availableTasks.length})
        </h2>
        
        {availableTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-500">No available tasks at the moment</p>
            <p className="text-sm text-gray-400">Check back in a few minutes</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {availableTasks.map((task) => (
              <div key={task._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTaskIcon(task.type)}</span>
                      <span className="text-lg font-bold text-blue-600">Bed {task.bedNumber}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-gray-800 mb-1">{task.patientName}</p>
                    <p className="text-gray-700 mb-2">{task.description}</p>
                    {task.location && (
                      <p className="text-sm text-gray-600 mb-2">📍 {task.location}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Created by {task.createdByName} • {new Date(task._creationTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptTask(task._id)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Accept Task
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Active Tasks */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          My Active Tasks ({activeTasks.length})
        </h2>
        
        {activeTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active tasks assigned to you</p>
        ) : (
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <div key={task._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTaskIcon(task.type)}</span>
                      <span className="text-lg font-bold text-blue-600">Bed {task.bedNumber}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-gray-800 mb-1">{task.patientName}</p>
                    <p className="text-gray-700 mb-2">{task.description}</p>
                    {task.location && (
                      <p className="text-sm text-gray-600 mb-2">📍 {task.location}</p>
                    )}
                    {task.notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-2">
                        📝 {task.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(task._creationTime).toLocaleString()}</p>
                    <p className="text-xs">#{task.taskId}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {task.status === "accepted" && (
                    <button
                      onClick={() => handleUpdateStatus(task._id, "in_progress")}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Start Task
                    </button>
                  )}
                  
                  {task.status === "in_progress" && (
                    <button
                      onClick={() => handleUpdateStatus(task._id, "done")}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Completed */}
      {completedTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recently Completed ({completedTasks.length})
          </h2>
          
          <div className="space-y-3">
            {completedTasks.slice(0, 5).map((task) => (
              <div key={task._id} className="border border-gray-200 rounded-lg p-4 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getTaskIcon(task.type)}</span>
                      <span className="text-lg font-bold text-blue-600">Bed {task.bedNumber}</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        COMPLETED ✓
                      </span>
                    </div>
                    <p className="font-medium text-gray-800">{task.patientName}</p>
                    <p className="text-gray-700">{task.description}</p>
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
