import { useEffect, useState } from "react";
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
  Calendar,
  Eye
} from "lucide-react";

import { Link } from "react-router-dom";
import { server } from "@/service/backendApi";


//defining manuscript types based on backend structure

type Author = {
  _id: string;
  name: string;
  email: string;
};

type Reviewer = {
  reviewer: {
    _id: string;
    name: string;
    email: string;
    reputation?: number;
  };
  assignedAt: string;
  status: string;
};

type Manuscript = {
  _id: string;
  title: string;
  abstract: string;
  keywords: string[];
  category: string;
  author: Author;
  reviewers: Reviewer[];
  deadline: string;
  status: string;
  submittedAt: string;
  contentHash: string;
  blockchain: {
    manuscriptId: string;
    transactionHash: string;
    blockNumber: number;
  };
};

type TimelineEvent = Manuscript;

const Timeline = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  //fetching user info and manuscripts from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, get user information to determine role
        console.log("Fetching user profile...");
        const userResponse = await server.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        console.log("User profile response:", userResponse.data);

        if (userResponse.data.success) {
          setUserRole(userResponse.data.user.role);
          console.log("User role:", userResponse.data.user.role);
          console.log("User ID:", userResponse.data.user._id);
        } else {
          console.log("Failed to get user profile:", userResponse.data);
        }

        // Then fetch manuscripts based on user role
        const manuscriptResponse = await server.get("/manuscript/getManuscripts", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        console.log("Timeline API Response:", manuscriptResponse.data);
        console.log("Token exists:", localStorage.getItem("token") ? "Yes" : "No");

        if (manuscriptResponse.data.success) {
          console.log("Manuscripts found:", manuscriptResponse.data.data?.manuscripts?.length || 0);
          setManuscripts(manuscriptResponse.data.data.manuscripts || []);
        } else {
          console.log("API returned success: false");
          setError("Failed to fetch manuscripts");
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to fetch data");
        // Fallback to empty array on error
        setManuscripts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "under_review":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "reviewed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "published":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      reviewed: "bg-green-100 text-green-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      published: "bg-emerald-100 text-emerald-800",
      draft: "bg-gray-100 text-gray-800"
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredManuscripts = manuscripts.filter(manuscript => {
    const matchesSearch = manuscript.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manuscript.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manuscript.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manuscript.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || manuscript.status === statusFilter;
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

        {/* Role-based viewing indicator */}
        {userRole && (
          <Card className="mb-6 border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">
                  {userRole === 'author' && "Viewing your submitted manuscripts"}
                  {userRole === 'reviewer' && "Viewing manuscripts assigned to you for review"}
                  {userRole !== 'author' && userRole !== 'reviewer' && "Viewing all manuscripts (Admin view)"}
                </span>
                <Badge variant="outline" className="ml-2">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="space-y-4">
          {loading ? (
            <Card className="p-6">
              <div className="text-center">Loading manuscripts...</div>
            </Card>
          ) : error ? (
            <Card className="p-6">
              <div className="text-center text-red-600">Error: {error}</div>
            </Card>
          ) : filteredManuscripts.length === 0 ? (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                {userRole === 'author' && "You haven't submitted any manuscripts yet"}
                {userRole === 'reviewer' && "No manuscripts have been assigned to you for review"}
                {userRole !== 'author' && userRole !== 'reviewer' && "No manuscripts found"}
                {!userRole && "No manuscripts found"}
              </div>
              {userRole === 'author' && (
                <div className="text-center mt-4">
                  <Link to="/submission">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Your First Manuscript
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          ) : (
            filteredManuscripts.map((manuscript) => (
              <Card key={manuscript._id} className="relative border-l-4 border-l-primary/50 hover:shadow-neural transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-secondary/20 rounded-full">
                      {getStatusIcon(manuscript.status)}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{manuscript.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Submitted: {new Date(manuscript.submittedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="h-4 w-4" />
                            Deadline: {new Date(manuscript.deadline).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        {getStatusBadge(manuscript.status)}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-1">
                          {userRole !== 'author' && (
                            <p className="text-sm"><span className="font-medium">Author:</span> {manuscript.author.name}</p>
                          )}
                          <p className="text-sm"><span className="font-medium">Category:</span> {manuscript.category}</p>
                          <p className="text-sm"><span className="font-medium">Keywords:</span> {manuscript.keywords.join(', ')}</p>
                          {manuscript.reviewers.length > 0 && (
                            <p className="text-sm">
                              <span className="font-medium">Reviewers:</span> {manuscript.reviewers.length} assigned
                            </p>
                          )}
                          {userRole === 'reviewer' && (
                            <p className="text-sm text-blue-600">
                              <span className="font-medium">Your Role:</span> Assigned Reviewer
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Content Hash:</span>
                            <span className="font-mono text-xs ml-1">{manuscript.contentHash.substring(0, 20)}...</span>
                          </p>
                          {manuscript.blockchain.transactionHash && (
                            <p className="text-sm">
                              <span className="font-medium">Tx Hash:</span>
                              <span className="font-mono text-xs ml-1">{manuscript.blockchain.transactionHash.substring(0, 20)}...</span>
                            </p>
                          )}
                          {manuscript.blockchain.blockNumber && (
                            <p className="text-sm">
                              <span className="font-medium">Block:</span> {manuscript.blockchain.blockNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Abstract */}
                      <div className="mt-4">
                        <p className="text-sm">
                          <span className="font-medium">Abstract:</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                          {manuscript.abstract}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Review Button for Reviewers */}
                  {userRole === 'reviewer' && (
                    <div className="absolute bottom-4 right-4">
                      <Link to={`/review/${manuscript._id}`}>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;