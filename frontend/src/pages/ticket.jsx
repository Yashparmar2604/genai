import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Toaster, toast } from "react-hot-toast";

// Helper Components
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
);

const ErrorAlert = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="alert alert-error max-w-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{message}</span>
    </div>
  </div>
);

const Badge = ({ type, value }) => {
  const badges = {
    status: {
      COMPLETED: "badge-success",
      IN_PROGRESS: "badge-warning",
      TODO: "badge-ghost"
    },
    priority: {
      high: "badge-error",
      medium: "badge-warning",
      low: "badge-info"
    }
  };

  return (
    <span className={`badge ${badges[type]?.[value] || "badge-ghost"} badge-lg`}>
      {value}
    </span>
  );
};

const StatusDropdown = ({ currentStatus, onUpdate, updating }) => (
  <div className="dropdown dropdown-end">
    <div tabIndex={0} className="cursor-pointer">
      <Badge type="status" value={currentStatus} />
    </div>
    <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
      {["TODO", "IN_PROGRESS", "COMPLETED"].map((status) => (
        <li key={status}>
          <button
            onClick={() => onUpdate(status)}
            disabled={currentStatus === status || updating}
            className={`${currentStatus === status ? 'active bg-base-200' : ''} flex items-center gap-2`}
          >
            <span className={
              status === "COMPLETED" ? "text-success" :
              status === "IN_PROGRESS" ? "text-warning" :
              "text-base-content"
            }>
              {status.replace('_', ' ')}
            </span>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default function TicketDetailsPage() {
  // State Management
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Hooks
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch Ticket Data
  const fetchTicket = useCallback(async () => {
    if (!token || !id) return;

    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch ticket");
      const data = await res.json();
      setTicket(data);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  // Update Status
  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      const updatedTicket = await res.json();
      setTicket(updatedTicket);
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!ticket) return <ErrorAlert message="Ticket not found" />;

  const canModifyTicket = user?.role === "admin" || 
    (user?.role === "moderator" && ticket.assignedTo?._id === user?._id);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Toaster position="top-right" />
      
      {/* Header Card */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold">{ticket.title}</h1>
            </div>

            {canModifyTicket && (
              <StatusDropdown 
                currentStatus={ticket.status}
                onUpdate={updateStatus}
                updating={updating}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Description</h2>
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {ticket.helpfulNotes && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body prose max-w-none">
                <h2 className="card-title">AI Analysis</h2>
                <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Moderator Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                {ticket.assignedTo ? 'Assigned Moderator' : 'Unassigned'}
              </h2>
              {ticket.assignedTo ? (
                <div className="flex items-center gap-4 mt-2">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-12">
                      <span className="text-xl">{ticket.assignedTo.name[0]}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{ticket.assignedTo.name}</p>
                    <p className="text-sm opacity-70">{ticket.assignedTo.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm opacity-70">No moderator assigned yet</p>
              )}
            </div>
          </div>

          {/* Details Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Badge type="priority" value={ticket.priority || 'low'} />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">Created</label>
                  <time className="text-sm opacity-70">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </time>
                </div>
                
                {ticket.updatedAt !== ticket.createdAt && (
                  <div>
                    <label className="text-sm font-medium block mb-1">Last Updated</label>
                    <time className="text-sm opacity-70">
                      {new Date(ticket.updatedAt).toLocaleString()}
                    </time>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}