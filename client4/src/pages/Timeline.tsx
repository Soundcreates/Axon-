import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Clock, 
  FileText, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowLeft,
  Search,
  Filter,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

const Timeline = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock timeline data - will be fetched from Supabase
  const timelineEvents = [
    {
      id: 1,
      type: "submission",
      title: "Advanced Neural Architecture Search",
      author: "Dr. Sarah Chen",
      timestamp: "2024-01-15T10:30:00Z",
      status: "under_review",
      tokensStaked: 50,
      reviewers: 3,
      dueDate: "2024-02-15T23:59:00Z"
    },
    {
      id: 2,
      type: "review_completed",
      title: "Quantum Computing Applications in ML",
      reviewer: "Dr. Michael Rodriguez",
      timestamp: "2024-01-14T16:45:00Z",
      status: "completed",
      tokensEarned: 25,
      rating: 4.8
    },
    {
      id: 3,
      type: "submission_accepted",
      title: "Federated Learning with Privacy Preservation",
      author: "Dr. Emily Watson",
      timestamp: "2024-01-13T14:20:00Z",
      status: "accepted",
      tokensReleased: 75,
      finalRating: 4.9
    },
    {
      id: 4,
      type: "review_assignment",
      title: "Transformer Architecture Improvements",
      assignedTo: "Dr. Sarah Chen",
      timestamp: "2024-01-12T09:15:00Z",
      status: "in_progress",
      tokensStaked: 50,
      deadline: "2024-01-26T23:59:00Z"
    },
    {
      id: 5,
      type: "submission_rejected",
      title: "Basic CNN Implementation Study",
      author: "John Smith",
      timestamp: "2024-01-11T11:30:00Z",
      status: "rejected",
      reason: "Insufficient novelty and methodology issues",
      tokensSlashed: 30
    }
  ];

  const getEventIcon = (type: string, status: string) => {
    switch (type) {
      case "submission":
        return <FileText className="h-5 w-5" />;
      case "review_completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "submission_accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "review_assignment":
        return <User className="h-5 w-5 text-blue-500" />;
      case "submission_rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      under_review: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      accepted: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredEvents = timelineEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.author?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (event.reviewer?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Activity Timeline</h1>
            <p className="text-muted-foreground">Track all manuscript submissions and review activities</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search manuscripts, authors, reviewers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="under_review">Under Review</option>
                  <option value="completed">Completed</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <Card key={event.id} className="border-l-4 border-l-primary/50 hover:shadow-neural transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-secondary/20 rounded-full">
                    {getEventIcon(event.type, event.status)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-1">
                        {event.author && (
                          <p className="text-sm"><span className="font-medium">Author:</span> {event.author}</p>
                        )}
                        {event.reviewer && (
                          <p className="text-sm"><span className="font-medium">Reviewer:</span> {event.reviewer}</p>
                        )}
                        {event.assignedTo && (
                          <p className="text-sm"><span className="font-medium">Assigned to:</span> {event.assignedTo}</p>
                        )}
                        {event.reason && (
                          <p className="text-sm text-red-600"><span className="font-medium">Reason:</span> {event.reason}</p>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {event.tokensStaked && (
                          <p className="text-sm text-blue-600">
                            <span className="font-medium">Tokens Staked:</span> {event.tokensStaked} AXON
                          </p>
                        )}
                        {event.tokensEarned && (
                          <p className="text-sm text-green-600">
                            <span className="font-medium">Tokens Earned:</span> {event.tokensEarned} AXON
                          </p>
                        )}
                        {event.tokensReleased && (
                          <p className="text-sm text-green-600">
                            <span className="font-medium">Tokens Released:</span> {event.tokensReleased} AXON
                          </p>
                        )}
                        {event.tokensSlashed && (
                          <p className="text-sm text-red-600">
                            <span className="font-medium">Tokens Slashed:</span> {event.tokensSlashed} AXON
                          </p>
                        )}
                        {event.rating && (
                          <p className="text-sm">
                            <span className="font-medium">Rating:</span> {event.rating}/5.0 ⭐
                          </p>
                        )}
                        {event.dueDate && (
                          <p className="text-sm text-orange-600">
                            <span className="font-medium">Due:</span> {new Date(event.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No activities found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Timeline;