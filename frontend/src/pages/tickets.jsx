import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Tickets() {
  // State Management
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Auth & Location
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to create ticket");

      setForm({ title: "", description: "" });
      toast.success("Ticket created successfully!");
      fetchTickets();
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.message);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Data Fetching
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get appropriate endpoint based on current route
      const endpoint = location.pathname === "/moderator" 
        ? '/tickets/moderator'
        : location.pathname === "/user-tickets"
        ? '/tickets/user'
        : '/tickets';

      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch tickets");

      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTickets();
  }, [token, location.pathname]);

  // Component: Ticket Card
  const TicketCard = ({ ticket }) => (
    <Link
      to={`/tickets/${ticket._id}`}
      className="card bg-base-100 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] border border-base-300"
    >
      <div className="card-body">
        <div className="flex justify-between items-start gap-4">
          <h3 className="card-title flex-1 text-lg">{ticket.title}</h3>
          <span className={`badge ${
            ticket.status === "COMPLETED" ? "badge-success" :
            ticket.status === "IN_PROGRESS" ? "badge-warning" :
            "badge-ghost"
          } badge-lg`}>
            {ticket.status}
          </span>
        </div>
        
        <p className="text-base-content/70 line-clamp-2 mt-2">
          {ticket.description}
        </p>
        
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {ticket.assignedTo?.name && (
            <div className="flex items-center gap-2 bg-base-200 px-3 py-1.5 rounded-full">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-6">
                  <span className="text-xs">{ticket.assignedTo.name.charAt(0)}</span>
                </div>
              </div>
              <span className="text-sm font-medium">{ticket.assignedTo.name}</span>
            </div>
          )}
          
          {ticket.priority && (
            <span className={`badge ${
              ticket.priority === "high" ? "badge-error" :
              ticket.priority === "medium" ? "badge-warning" :
              "badge-info"
            } badge-sm`}>
              {ticket.priority}
            </span>
          )}
          
          <span className="text-xs text-base-content/50 ml-auto">
            {new Date(ticket.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );

  // Loading State
  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Create Ticket Form - Only for users */}
      {user?.role === "user" && (
        <div className="card bg-base-100 shadow-xl mb-8 border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-2">Create Support Ticket</h2>
            <p className="text-sm text-base-content/70 mb-6">
              Our AI will analyze your issue and assign the best moderator to help you.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Issue Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="E.g., Cannot connect to database"
                  className="input input-bordered w-full focus:input-primary"
                  required
                  minLength={3}
                  maxLength={100}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Please describe your issue in detail..."
                  className="textarea textarea-bordered h-32 focus:textarea-primary"
                  required
                  minLength={10}
                />
              </div>

              {error && (
                <div className="alert alert-error">{error}</div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating...
                  </>
                ) : (
                  "Create Ticket"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {location.pathname === "/moderator" 
              ? "My Assigned Tickets"
              : location.pathname === "/user-tickets"
              ? "My Tickets"
              : "All Support Tickets"}
          </h2>
          
          <div className="flex items-center gap-2">
            <div className="btn-group">
              <Link to="/" className={`btn btn-sm ${location.pathname === "/" ? 'btn-active' : ''}`}>
                All
              </Link>
              {user?.role === "moderator" && (
                <Link to="/moderator" className={`btn btn-sm ${location.pathname === "/moderator" ? 'btn-active' : ''}`}>
                  Assigned
                </Link>
              )}
              {user?.role === "user" && (
                <Link to="/user-tickets" className={`btn btn-sm ${location.pathname === "/user-tickets" ? 'btn-active' : ''}`}>
                  Mine
                </Link>
              )}
            </div>

            <span className="badge badge-neutral badge-lg">
              {tickets.length} tickets
            </span>

            <button 
              onClick={fetchTickets}
              className="btn btn-ghost btn-sm btn-circle"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-12 bg-base-200 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-base-content/30" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <p className="text-base-content/70 mt-4">No tickets found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tickets.map(ticket => (
              <TicketCard key={ticket._id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}