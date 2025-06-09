import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Select endpoint based on user role
      const endpoint = user?.role === 'moderator' 
        ? '/tickets/moderator'
        : user?.role === 'user' 
        ? '/tickets/user'
        : '/tickets';

      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchTickets();
    }
  }, [token, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {user?.role === "admin" 
            ? "All Support Tickets" 
            : user?.role === "moderator"
            ? "Tickets Assigned to You"
            : "Your Tickets"}
        </h2>
        <div className="flex gap-2 items-center">
          <span className="badge badge-neutral badge-lg">
            {tickets.length} tickets
          </span>
          <button 
            onClick={fetchTickets} 
            className="btn btn-ghost btn-sm btn-circle"
            title="Refresh tickets"
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
  );
}