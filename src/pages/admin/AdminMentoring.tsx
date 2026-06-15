import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, GraduationCap, BookOpen, MessageSquare, Clock, CheckCircle, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  status: string;
  created_at: string;
}

const AdminMentoring = () => {
  const [requests, setRequests] = useState<MentoringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<MentoringRequest | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("mentoring_requests" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests((data as any) || []);
    } catch (err) {
      console.error("Error fetching mentoring requests:", err);
      toast.error("Failed to load mentoring requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("mentoring_requests" as any)
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Request ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      fetchRequests();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      await supabase.from("mentoring_requests" as any).delete().eq("id", id);
      toast.success("Request deleted successfully");
      fetchRequests();
    } catch (err) {
      console.error("Error deleting request:", err);
      toast.error("Failed to delete request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Mentoring Requests</h2>

      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-slate-700">All Requests</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No mentoring requests found</p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <Card key={request.id} className="p-4 bg-card border border-border shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-semibold text-sm truncate">{request.name}</h4>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>
                    
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{request.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3 h-3 shrink-0" />
                        <span>{request.phone}</span>
                      </div>
                      {request.attempt && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <GraduationCap className="w-3 h-3 shrink-0" />
                          <span>Attempt: {request.attempt}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-600">
                        <BookOpen className="w-3 h-3 shrink-0" />
                        <span className="capitalize">{request.preparation_stage?.replace('_', ' ')}</span>
                      </div>
                      {request.optional_subject && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <BookOpen className="w-3 h-3 shrink-0" />
                          <span>Optional: {request.optional_subject}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-600">
                        <span>Language: {request.preferred_language}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span>Topic: {request.mentoring_topic}</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{request.message}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    {request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-600 hover:bg-emerald-50"
                          onClick={() => handleUpdateStatus(request.id, "approved")}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleUpdateStatus(request.id, "rejected")}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(request.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMentoring;
