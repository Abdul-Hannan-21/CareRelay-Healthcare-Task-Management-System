import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function PatientDashboard() {
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const tasks = useQuery(api.tasks.getTasksForRole);
  const createTask = useMutation(api.tasks.createTask);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [taskType, setTaskType] = useState<"transport" | "meal" | "cleaning" | "interpreter" | "equipment" | "nursing">("nursing");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    const timeout = setTimeout(() => {
      toast.info("Session expired for privacy. Please log in again.");
      // In a real app, you'd call signOut here
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearTimeout(timeout);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await createTask({
        type: taskType,
        priority,
        bedNumber: userProfile.bedNumber || "",
        patientName: userProfile.name,
        description: description.trim(),
        location: location.trim() || undefined,
        caseNumber: userProfile.caseNumber,
      });
      
      toast.success("Request submitted successfully!");
      setDescription("");
      setLocation("");
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Failed to submit request");
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-2xl font-bold text-gray-800">Patient Portal</h1>
            <p className="text-gray-600">
              Welcome, {userProfile?.name} • Bed {userProfile?.bedNumber} • Case #{userProfile?.caseNumber}
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? "Cancel" : "Request Assistance"}
          </button>
        </div>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Assistance</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Assistance
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="nursing">👨‍⚕️ Nursing Assistance</option>
                  <option value="transport">🚚 Transport</option>
                  <option value="meal">🍽️ Meal Request</option>
                  <option value="cleaning">🧹 Room Cleaning</option>
                  <option value="interpreter">🗣️ Interpreter</option>
                  <option value="equipment">🔧 Equipment</option>
                </select>
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
                  <option value="low">🟢 Low - Can wait</option>
                  <option value="medium">🟢 Medium - Normal</option>
                  <option value="high">🟠 High - Important</option>
                  <option value="urgent">🔴 Urgent - Immediate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Please describe what you need help with..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Details (optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Radiology, Cafeteria, Room 205"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}

      {/* Active Requests */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Your Active Requests ({activeTasks.length})
        </h2>
        
        {activeTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active requests</p>
        ) : (
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <div key={task._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium">{task.description}</p>
                    {task.location && (
                      <p className="text-sm text-gray-600">📍 {task.location}</p>
                    )}
                    {task.assignedToName && (
                      <p className="text-sm text-blue-600">👤 Assigned to: {task.assignedToName}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(task._creationTime).toLocaleString()}</p>
                    <p className="text-xs">#{task.taskId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Requests */}
      {completedTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Completed Requests ({completedTasks.length})
          </h2>
          
          <div className="space-y-3">
            {completedTasks.slice(0, 5).map((task) => (
              <div key={task._id} className="border border-gray-200 rounded-lg p-4 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        COMPLETED ✓
                      </span>
                      <span className="text-xs text-gray-500">
                        {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
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
