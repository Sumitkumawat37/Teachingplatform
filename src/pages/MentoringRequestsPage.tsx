import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Clock, User, Mail, Phone, BookOpen, MessageSquare, Award, Filter, Download } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

interface MentoringRequest {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  attempt: number | null;
  preparation_stage: string;
  optional_subject: string;
  preferred_language: string;
  mentoring_topic: string;
  message: string;
  question1_answer: string;
  question2_answer: string;
  question3_answer: string;
  status: string;
  payment_status: string;
  payment_id: string | null;
  created_at: string;
}

const MentoringRequestsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<MentoringRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MentoringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedRequest, setSelectedRequest] = useState<MentoringRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(req => req.status === filter));
    }
  }, [filter, requests]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("mentoring_requests" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
      setFilteredRequests(data || []);
    } catch (err) {
      console.error("Error fetching mentoring requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("mentoring_requests" as any)
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;
      fetchRequests();
      alert(`Request ${newStatus} successfully`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-emerald-100 text-emerald-700",
      rejected: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus: string) => {
    const styles = {
      paid: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[paymentStatus as keyof typeof styles] || styles.pending}`}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Mentoring Requests
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            View and manage student mentoring requests
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
        >
          Back
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm text-slate-800"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No mentoring requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="rounded-2xl p-6 shadow-sm border border-slate-100/60 bg-white hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{request.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{request.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{request.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(request.status)}
                  {getPaymentBadge(request.payment_status)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] text-slate-500 mb-1">Attempt</p>
                  <p className="text-sm font-medium text-slate-800">{request.attempt || "N/A"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] text-slate-500 mb-1">Stage</p>
                  <p className="text-sm font-medium text-slate-800 capitalize">{request.preparation_stage}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] text-slate-500 mb-1">Optional</p>
                  <p className="text-sm font-medium text-slate-800">{request.optional_subject || "N/A"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] text-slate-500 mb-1">Language</p>
                  <p className="text-sm font-medium text-slate-800 capitalize">{request.preferred_language}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] text-slate-500 mb-1">Mentoring Topic</p>
                <p className="text-sm text-slate-800">{request.mentoring_topic}</p>
              </div>

              <div className="mb-4">
                <p className="text-[10px] text-slate-500 mb-1">Message</p>
                <p className="text-sm text-slate-700">{request.message}</p>
              </div>

              {/* Question Answers */}
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-violet-50 rounded-lg">
                  <p className="text-[10px] text-violet-600 mb-1 font-medium">Q1: Inter-linking of rivers</p>
                  <p className="text-sm text-slate-700">{request.question1_answer}</p>
                </div>
                <div className="p-3 bg-violet-50 rounded-lg">
                  <p className="text-[10px] text-violet-600 mb-1 font-medium">Q2: Left-Wing Extremism (LWE)</p>
                  <p className="text-sm text-slate-700">{request.question2_answer}</p>
                </div>
                <div className="p-3 bg-violet-50 rounded-lg">
                  <p className="text-[10px] text-violet-600 mb-1 font-medium">Q3: Iran-US Conflict</p>
                  <p className="text-sm text-slate-700">{request.question3_answer}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <p className="text-[10px] text-slate-400">
                  Submitted: {new Date(request.created_at).toLocaleString()}
                </p>
                {request.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateStatus(request.id, "approved")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(request.id, "rejected")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MentoringRequestsPage;
