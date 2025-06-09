import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch ticket");
        }

        const data = await res.json();
        setTicket(data);
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) fetchTicket();
  }, [id, token]);

  const renderStatusBadge = (status) => (
    <span className={`badge ${
      status === "COMPLETED" ? "badge-success" :
      status === "IN_PROGRESS" ? "badge-warning" :
      "badge-ghost"
    }`}>
      {status}
    </span>
  );

  const renderPriorityBadge = (priority) => (
    <span className={`badge ${
      priority === "high" ? "badge-error" :
      priority === "medium" ? "badge-warning" :
      "badge-info"
    }`}>
      {priority}
    </span>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-warning max-w-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Ticket not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body space-y-6">
          {/* Header with Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/")}
                className="btn btn-ghost btn-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </button>
              <h2 className="text-2xl font-bold">{ticket.title}</h2>
            </div>
            {renderStatusBadge(ticket.status)}
          </div>

          {/* Description */}
          <div className="bg-base-300 p-4 rounded-lg">
            <p className="whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Status and Assignment */}
            <div className="space-y-4">
              {/* Priority */}
              {ticket.priority && (
                <div>
                  <span className="font-semibold block mb-2">Priority</span>
                  {renderPriorityBadge(ticket.priority)}
                </div>
              )}

              {/* Assigned Moderator */}
{ticket.assignedTo?.name && (  // Add optional chaining and name check
  <div className="card bg-base-300 p-4 rounded-lg">
    <span className="font-semibold mb-3">Assigned Moderator</span>
    <div className="flex items-center gap-3">
      <div className="avatar placeholder">
        <div className="bg-neutral text-neutral-content rounded-full w-12">
          <span className="text-xl">
            {ticket.assignedTo.name.charAt(0) || '?'}  {/* Add fallback */}
          </span>
        </div>
      </div>
      <div>
        <p className="font-medium">{ticket.assignedTo.name}</p>
        <p className="text-sm text-base-content/70">{ticket.assignedTo.email}</p>
      </div>
    </div>
  </div>
)}

              {/* Timeline */}
              <div>
                <span className="font-semibold block mb-2">Timeline</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Created:</span>
                    <span className="text-sm text-base-content/70">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {ticket.assignedTo && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <span className="text-sm">Assigned to:</span>
                      <span className="text-sm text-base-content/70">
                        {ticket.assignedTo.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Skills and AI Analysis */}
            <div className="space-y-4">
              {/* Required Skills */}
              {ticket.relatedSkills?.length > 0 && (
                <div>
                  <span className="font-semibold block mb-2">Required Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {ticket.relatedSkills.map((skill, index) => (
                      <span key={index} className="badge badge-primary">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              {ticket.helpfulNotes && (
                <div className="card bg-base-300 p-4 rounded-lg">
                  <span className="font-semibold block mb-2">AI Analysis</span>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}