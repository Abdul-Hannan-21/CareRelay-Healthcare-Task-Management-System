import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function NurseDashboard() {
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const tasks = useQuery(api.tasks.getTasksForRole);
  const createTask = useMutation(api.tasks.createTask);
  const acceptTask = useMutation(api.tasks.acceptTask);
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const updateTaskNotes = useMutation(api.tasks.updateTaskNotes);
  const deleteTask = useMutation(api.tasks.deleteTask);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [taskType, setTaskType] = useState<"transport" | "meal" | "cleaning" | "interpreter" | "equipment" | "nursing">("nursing");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [bedNumber, setBedNumber] = useState("");
  const [patientName, setPatientName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedNumber.trim() || !patientName.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await createTask({
        type: taskType,
        priority,
        bedNumber: bedNumber.trim(),
        patientName: patientName.trim(),
        description: description.trim(),
        location: location.trim() || undefined,
      });
      
      toast.success("Task created successfully!");
      setBedNumber("");
      setPatientName("");
      setDescription("");
      setLocation("");
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Failed to create task");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      await acceptTask({ taskId: taskId as any });
      toast.success("Task accepted!");
    } catch (error) {
      toast.error("Failed to accept task");
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

  const handleUpdateNotes = async (taskId: string) => {
    try {
      await updateTaskNotes({ taskId: taskId as any, notes: notesValue });
      toast.success("Notes updated!");
      setEditingNotes(null);
      setNotesValue("");
    } catch (error) {
      toast.error("Failed to update notes");
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

  const activeTasks = tasks?.filter(task => task.status !== "done") || [];
  const completedTasks = tasks?.filter(task => task.status === "done") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Nurse Dashboard</h1>
            <p className="text-gray-600">
              Welcome, {userProfile?.name} • {userProfile?.department || "General Ward"}
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? "Cancel" : "Create Task"}
          </button>
        </div>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Task</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bed Number *
                </label>
                <input
                  type="text"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 23, A-101"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Patient's full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟢 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Type
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="nursing">👨‍⚕️ Nursing Care</option>
                  <option value="transport">🚚 Transport</option>
                  <option value="meal">🍽️ Meal Service</option>
                  <option value="cleaning">🧹 Cleaning</option>
                  <option value="interpreter">🗣️ Interpreter</option>
                  <option value="equipment">🔧 Equipment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Radiology, OR 3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe the task in detail..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !bedNumber.trim() || !patientName.trim() || !description.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </form>
        </div>
      )}

      {/* Active Tasks */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Active Tasks ({activeTasks.length})
        </h2>
        
        {activeTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active tasks</p>
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
                    </div>
                    <p className="text-gray-800 mb-2">{task.description}</p>
                    {task.location && (
                      <p className="text-sm text-gray-600 mb-2">📍 {task.location}</p>
                    )}
                    {task.assignedToName && (
                      <p className="text-sm text-blue-600 mb-2">👤 Assigned to: {task.assignedToName}</p>
                    )}
                    
                    {/* Notes Section */}
                    <div className="mt-3">
                      {editingNotes === task._id ? (
                        <div className="space-y-2">
                          <textarea
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            rows={2}
                            placeholder="Add notes..."
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateNotes(task._id)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingNotes(null);
                                setNotesValue("");
                              }}
                              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {task.notes && (
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-2">
                              📝 {task.notes}
                            </p>
                          )}
                          <button
                            onClick={() => {
                              setEditingNotes(task._id);
                              setNotesValue(task.notes || "");
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {task.notes ? "Edit Notes" : "Add Notes"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(task._creationTime).toLocaleString()}</p>
                    <p className="text-xs">#{task.taskId}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  {task.status === "new" && (
                    <button
                      onClick={() => handleAcceptTask(task._id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Accept Task
                    </button>
                  )}
                  
                  {task.status === "accepted" && task.assignedToName === userProfile?.name && (
                    <button
                      onClick={() => handleUpdateStatus(task._id, "in_progress")}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                    >
                      Start Task
                    </button>
                  )}
                  
                  {task.status === "in_progress" && task.assignedToName === userProfile?.name && (
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
            Recently Completed ({completedTasks.length})
          </h2>
          
          <div className="space-y-3">
            {completedTasks.slice(0, 10).map((task) => (
              <div key={task._id} className="border border-gray-200 rounded-lg p-4 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-blue-600">Bed {task.bedNumber}</span>
                      <span className="font-medium text-gray-800">{task.patientName}</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        COMPLETED ✓
                      </span>
                    </div>
                    <p className="text-gray-800">{task.description}</p>
                    {task.assignedToName && (
                      <p className="text-sm text-gray-600">Completed by: {task.assignedToName}</p>
                    )}
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
