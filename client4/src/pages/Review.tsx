import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  Eye,
  Download,
  MessageSquare,
  Coins,
  AlertTriangle,
  ExternalLink,
  FileIcon,
  Loader2
} from "lucide-react";
import { server } from "@/service/backendApi";
import { useAuth } from "@/context/AuthContext";
import { useContracts } from "@/context/ContractContext";
import { useWallet } from "@/context/WalletContext";
import { toast } from "sonner";
import { ethers } from "ethers";

// Types based on the manuscript model
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
  };
  assignedAt: string;
  status: 'assigned' | 'accepted' | 'declined' | 'completed';
};

type Manuscript = {
  _id: string;
  title: string;
  abstract: string;
  keywords: string[];
  category: string;
  author: Author;
  coAuthors: Array<{
    name: string;
    email: string;
    affiliation: string;
  }>;
  contentHash: string;
  status: string;
  reviewers: Reviewer[];
  deadline: string;
  submittedAt: string;
  metadata: {
    fileSize: number;
    fileName: string;
    mimeType: string;
  };
  blockchain: {
    manuscriptId: string;
    transactionHash: string;
    blockNumber: number;
  };
};

const Review = () => {
  const { manuscriptId } = useParams<{ manuscriptId: string }>();
  const [manuscript, setManuscript] = useState<Manuscript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isStakingForReview, setIsStakingForReview] = useState(false);
  const [hasStaked, setHasStaked] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [reviewComments, setReviewComments] = useState("");
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const [reviewerStakeAmount, setReviewerStakeAmount] = useState<bigint>(0n);
  const [authorStakeAmount, setAuthorStakeAmount] = useState<bigint>(0n);
  const { user } = useAuth();
  const { peerReview_submitReview, peerReview_stakeForReview, peerReview_finalizePeriod, getManuscriptDetails: getContractManuscript, generateManuscriptId, getStakeAmount, getRewardAmount } = useContracts();
  const { account, status: walletStatus } = useWallet();

  useEffect(() => {
    const fetchManuscript = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user info
        const userResponse = await server.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (userResponse.data.success) {
          setUserRole(userResponse.data.user.role);
        }

        // Get manuscript details
        const manuscriptResponse = await server.get(`/manuscript/getManuscript/${manuscriptId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (manuscriptResponse.data.success) {
          const manuscriptData = manuscriptResponse.data.data;
          setManuscript(manuscriptData);

          // Check if current user has already reviewed
          const currentUserId = userResponse.data.user._id;
          const currentUserReviewer = manuscriptData.reviewers.find(
            (r: Reviewer) => r.reviewer._id === currentUserId
          );

          if (currentUserReviewer && currentUserReviewer.status === 'completed') {
            setHasReviewed(true);
          }

          // Check if deadline has passed
          const deadline = new Date(manuscriptData.deadline);
          const now = new Date();
          setIsDeadlinePassed(now > deadline);

          // Fetch document from backend
          await fetchDocumentFromBackend(manuscriptId);

          // Fetch stake amounts from contract
          await fetchStakeAmounts();
        } else {
          setError("Failed to fetch manuscript details");
        }
      } catch (err: any) {
        console.error("Error fetching manuscript:", err);
        setError("Failed to load manuscript details");
      } finally {
        setLoading(false);
      }
    };

    if (manuscriptId) {
      fetchManuscript();
    }
  }, [manuscriptId]);

  const fetchDocumentFromBackend = async (manuscriptId: string) => {
    try {
      setIsLoadingDocument(true);
      setDocumentError(null);

      // Fetch document info from backend API
      const response = await server.get(`/manuscript/getDocument/${manuscriptId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data.success && response.data.data.accessible) {
        setDocumentUrl(response.data.data.documentUrl);
        console.log("Document fetched successfully:", response.data.data);
      } else {
        throw new Error(response.data.error || "Document not accessible");
      }
    } catch (err: any) {
      console.error("Error fetching document from backend:", err);
      setDocumentError(err.response?.data?.message || "Failed to load document. Please try again later.");
    } finally {
      setIsLoadingDocument(false);
    }
  };

  const fetchStakeAmounts = async () => {
    try {
      if (walletStatus === 'connected' && getStakeAmount) {
        // Get the reviewer stake amount from contract
        const stakeAmount = await getStakeAmount();
        setReviewerStakeAmount(stakeAmount);

        // For now, we'll use the contract stake amount as the author stake amount
        // In a real implementation, you might want to get this from the manuscript data
        setAuthorStakeAmount(stakeAmount);

        console.log("Stake amounts fetched:", {
          reviewerStake: ethers.formatEther(stakeAmount.toString()),
          authorStake: ethers.formatEther(stakeAmount.toString())
        });
      }
    } catch (err: any) {
      console.error("Error fetching stake amounts:", err);
      // Fallback to 10% of a default amount if contract call fails
      const fallbackAmount = ethers.parseEther("5"); // 5 AXON as fallback
      setReviewerStakeAmount(fallbackAmount);
      setAuthorStakeAmount(fallbackAmount);
    }
  };

  const handleStakeForReview = async () => {
    if (!manuscript || !account) return;

    try {
      setIsStakingForReview(true);

      // Use the stored blockchain manuscript ID from the database
      const manuscriptIdBytes32 = manuscript.blockchain?.manuscriptId;

      if (!manuscriptIdBytes32) {
        throw new Error("Manuscript blockchain ID not found. Please contact support.");
      }

      console.log("Using stored manuscript ID for staking:", manuscriptIdBytes32);
      await peerReview_stakeForReview(manuscriptIdBytes32);
      setHasStaked(true);
      toast.success("Successfully staked for review!");
    } catch (err: any) {
      console.error("Error staking for review:", err);
      toast.error("Failed to stake for review: " + err.message);
    } finally {
      setIsStakingForReview(false);
    }
  };

  const handleMarkAsReviewed = async () => {
    if (!manuscript) return;

    // Validate review comments
    if (!reviewComments.trim()) {
      toast.error("Please provide your review comments before submitting.");
      return;
    }

    // Check if reviewer has staked
    if (!hasStaked) {
      toast.error("You must stake tokens before submitting your review.");
      return;
    }

    try {
      setIsSubmittingReview(true);

      // First, submit review to blockchain if wallet is connected
      if (account && walletStatus === 'connected') {
        try {
          // Use the stored blockchain manuscript ID from the database
          const manuscriptIdBytes32 = manuscript.blockchain?.manuscriptId;

          if (!manuscriptIdBytes32) {
            throw new Error("Manuscript blockchain ID not found. Please contact support.");
          }

          // Create a review hash from the actual review comments
          const reviewHash = ethers.keccak256(
            ethers.toUtf8Bytes(`Review for ${manuscript.title} by ${account} at ${Date.now()}: ${reviewComments}`)
          );

          console.log("Using stored manuscript ID for review submission:", manuscriptIdBytes32);
          await peerReview_submitReview(manuscriptIdBytes32, reviewHash);
          toast.success("Review submitted to blockchain!");
        } catch (blockchainError: any) {
          console.error("Blockchain submission failed:", blockchainError);
          toast.warning("Review marked locally but blockchain submission failed: " + blockchainError.message);
        }
      }

      // Then update the backend with review comments
      const response = await server.post(
        `/manuscript/markReviewComplete/${manuscript._id}`,
        {
          reviewComments: reviewComments.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.data.success) {
        setHasReviewed(true);

        // Update the manuscript state to reflect the change
        setManuscript(prev => prev ? {
          ...prev,
          reviewers: prev.reviewers.map(r =>
            r.reviewer._id === response.data.userId
              ? { ...r, status: 'completed' as const }
              : r
          ),
          status: response.data.data.allReviewsComplete ? 'reviewed' : prev.status
        } : null);

        // Show appropriate success message based on completion status
        if (response.data.data.allReviewsComplete) {
          toast.success(`🎉 All reviews completed! You earned ${response.data.data.tokensAwarded} AXON tokens!`);
          toast.success(`Manuscript "${manuscript.title}" has been automatically finalized with rewards distributed to all reviewers!`);
        } else {
          toast.success("Review submitted successfully!");
        }
      } else {
        setError("Failed to mark review as complete");
        toast.error("Failed to mark review as complete");
      }
    } catch (err: any) {
      console.error("Error marking review as complete:", err);
      setError("Failed to mark review as complete");
      toast.error("Failed to mark review as complete: " + err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Auto-finalization is now handled automatically in the backend when all reviews are completed

  const handleFinalizeReview = async () => {
    if (!manuscript) return;

    try {
      setIsFinalizing(true);

      // First, finalize on blockchain if wallet is connected
      if (account && walletStatus === 'connected') {
        try {
          // Use the stored blockchain manuscript ID from the database
          const manuscriptIdBytes32 = manuscript.blockchain?.manuscriptId;

          if (!manuscriptIdBytes32) {
            throw new Error("Manuscript blockchain ID not found. Please contact support.");
          }

          console.log("Using stored manuscript ID for finalization:", manuscriptIdBytes32);
          await peerReview_finalizePeriod(manuscriptIdBytes32);
          toast.success("Review period finalized on blockchain!");
        } catch (blockchainError: any) {
          console.error("Blockchain finalization failed:", blockchainError);
          toast.warning("Finalized locally but blockchain finalization failed: " + blockchainError.message);
        }
      }

      // Then update the backend
      const response = await server.post(
        `/manuscript/finalizeReview/${manuscript._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.data.success) {
        setManuscript(prev => prev ? { ...prev, status: 'reviewed' } : null);
        toast.success("Review process finalized successfully!");
      } else {
        setError("Failed to finalize review process");
        toast.error("Failed to finalize review process");
      }
    } catch (err: any) {
      console.error("Error finalizing review:", err);
      setError("Failed to finalize review process");
      toast.error("Failed to finalize review process: " + err.message);
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleDeadlineFinalization = async () => {
    if (!manuscript || !isDeadlinePassed) return;

    try {
      setIsFinalizing(true);

      // First, finalize on blockchain if wallet is connected
      if (account && walletStatus === 'connected') {
        try {
          // Use the stored blockchain manuscript ID from the database
          const manuscriptIdBytes32 = manuscript.blockchain?.manuscriptId;

          if (!manuscriptIdBytes32) {
            throw new Error("Manuscript blockchain ID not found. Please contact support.");
          }

          console.log("Using stored manuscript ID for deadline finalization:", manuscriptIdBytes32);
          await peerReview_finalizePeriod(manuscriptIdBytes32);
          toast.success("Review period finalized on blockchain due to deadline!");
        } catch (blockchainError: any) {
          console.error("Blockchain finalization failed:", blockchainError);
          toast.warning("Finalized locally but blockchain finalization failed: " + blockchainError.message);
        }
      }

      // Then update the backend
      const response = await server.post(
        `/manuscript/finalizeReview/${manuscript._id}`,
        { deadlinePassed: true },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.data.success) {
        setManuscript(prev => prev ? { ...prev, status: 'reviewed' } : null);
        toast.success("Review process finalized due to deadline. Incomplete reviewers may face token slashing.");
      } else {
        setError("Failed to finalize review process");
        toast.error("Failed to finalize review process");
      }
    } catch (err: any) {
      console.error("Error finalizing review:", err);
      setError("Failed to finalize review process");
      toast.error("Failed to finalize review process: " + err.message);
    } finally {
      setIsFinalizing(false);
    }
  };

  const getReviewerStatusBadge = (status: string) => {
    const variants = {
      assigned: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      declined: "bg-red-100 text-red-800",
      completed: "bg-green-100 text-green-800"
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-6">
            <div className="text-center">Loading manuscript details...</div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !manuscript) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-6">
            <div className="text-center text-red-600">Error: {error || "Manuscript not found"}</div>
            <div className="text-center mt-4">
              <Link to="/timeline">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Timeline
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/timeline">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Timeline
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Review Manuscript</h1>
            <p className="text-muted-foreground">Review and provide feedback on the assigned manuscript</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Document Viewing */}
          <div className="lg:col-span-2 space-y-6">
            {/* Manuscript Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  {manuscript.title}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Category: {manuscript.category}</span>
                    <span>•</span>
                    <span>Submitted: {new Date(manuscript.submittedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Deadline: {new Date(manuscript.deadline).toLocaleDateString()}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Author Information */}
                <div>
                  <h4 className="font-semibold mb-2">Author Information</h4>
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <Avatar>
                      <AvatarFallback>{manuscript.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{manuscript.author.name}</p>
                      <p className="text-sm text-muted-foreground">{manuscript.author.email}</p>
                    </div>
                  </div>
                </div>

                {/* Co-Authors */}
                {manuscript.coAuthors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Co-Authors</h4>
                    <div className="space-y-2">
                      {manuscript.coAuthors.map((coAuthor, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg">
                          <Avatar>
                            <AvatarFallback>{coAuthor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{coAuthor.name}</p>
                            <p className="text-sm text-muted-foreground">{coAuthor.email}</p>
                            {coAuthor.affiliation && (
                              <p className="text-xs text-muted-foreground">{coAuthor.affiliation}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Abstract */}
                <div>
                  <h4 className="font-semibold mb-2">Abstract</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {manuscript.abstract}
                  </p>
                </div>

                {/* Keywords */}
                <div>
                  <h4 className="font-semibold mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {manuscript.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Document Actions */}
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Document</h4>
                  {isLoadingDocument ? (
                    <div className="flex items-center gap-2 p-4 bg-secondary/20 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading document...</span>
                    </div>
                  ) : documentError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Document Error</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">{documentError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => fetchDocumentFromBackend(manuscriptId)}
                      >
                        Retry Loading
                      </Button>
                    </div>
                  ) : documentUrl ? (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(documentUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Document
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = documentUrl;
                            link.download = `${manuscript.title}.pdf`;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <FileIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">Document Available</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Document is accessible via IPFS. Click "View Document" to open in a new tab.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Document Not Available</span>
                      </div>
                      <p className="text-sm text-yellow-600 mt-1">
                        Unable to load document. Please contact the author.
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Content Hash: {manuscript.contentHash}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Reviewers and Actions */}
          <div className="space-y-6">
            {/* Reviewers Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Review Team
                </CardTitle>
                <CardDescription>
                  {manuscript.reviewers.length} reviewers assigned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {manuscript.reviewers.map((reviewer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{reviewer.reviewer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{reviewer.reviewer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Assigned: {new Date(reviewer.assignedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getReviewerStatusBadge(reviewer.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wallet Connection Prompt */}
            {walletStatus !== 'connected' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    Connect Wallet
                  </CardTitle>
                  <CardDescription>
                    Connect your wallet to use blockchain features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Coins className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="font-medium text-yellow-800 mb-2">Wallet Not Connected</p>
                    <p className="text-sm text-yellow-600 mb-3">
                      Connect your wallet to stake tokens and submit reviews on the blockchain
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = '/dashboard'}
                    >
                      Go to Dashboard to Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blockchain Staking */}
            {walletStatus === 'connected' && !hasStaked && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    Required Staking
                  </CardTitle>
                  <CardDescription>
                    You must stake tokens before submitting your review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-800">Required Stake:</span>
                        <span className="text-sm font-bold text-yellow-900">
                          {ethers.formatEther(reviewerStakeAmount.toString())} AXON
                        </span>
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">
                        This stake is required to submit your review and will be returned upon completion
                      </p>
                    </div>
                    <Button
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                      onClick={handleStakeForReview}
                      disabled={isStakingForReview}
                    >
                      {isStakingForReview ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Staking...
                        </>
                      ) : (
                        <>
                          <Coins className="h-4 w-4 mr-2" />
                          Stake {ethers.formatEther(reviewerStakeAmount.toString())} AXON
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Staking is mandatory to participate in the review process
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasStaked && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-800">Staked Successfully</p>
                    <p className="text-sm text-green-600">
                      You have staked {ethers.formatEther(reviewerStakeAmount.toString())} AXON for this review
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      You can now submit your review
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Deadline Warning */}
            {isDeadlinePassed && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Deadline Passed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-600">
                    The review deadline has passed. Late submissions may result in token slashing.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Review Comments */}
            {!hasReviewed && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Review Comments
                  </CardTitle>
                  <CardDescription>
                    Provide detailed feedback on the manuscript
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="reviewComments">Your Review *</Label>
                      <Textarea
                        id="reviewComments"
                        placeholder="Please provide detailed feedback on the manuscript including strengths, weaknesses, and recommendations for improvement..."
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        rows={6}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {reviewComments.length}/1000 characters
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  Review Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasReviewed ? (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-800">Review Completed</p>
                    <p className="text-sm text-green-600">You have marked this manuscript as reviewed</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleMarkAsReviewed}
                      disabled={isSubmittingReview || !reviewComments.trim() || !hasStaked}
                    >
                      {isSubmittingReview ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Submit Review
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      {!hasStaked && "You must stake tokens before submitting your review."}
                      {hasStaked && !reviewComments.trim() && "Please provide review comments before submitting."}
                      {hasStaked && reviewComments.trim() && "This will mark your individual review as complete. When all reviewers finish, you'll automatically receive 25 AXON tokens!"}
                    </p>
                  </div>
                )}

                <Separator />

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Need to discuss with other reviewers?</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Open Discussion
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Review Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Review Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completed Reviews</span>
                    <span>
                      {manuscript.reviewers.filter(r => r.status === 'completed').length} / {manuscript.reviewers.length}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(manuscript.reviewers.filter(r => r.status === 'completed').length / manuscript.reviewers.length) * 100}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {manuscript.reviewers.filter(r => r.status === 'completed').length === manuscript.reviewers.length
                      ? "All reviews completed!"
                      : `${manuscript.reviewers.length - manuscript.reviewers.filter(r => r.status === 'completed').length} reviews remaining`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Author Finalization */}
            {userRole === 'author' && manuscript.status !== 'reviewed' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Finalize Review Process
                  </CardTitle>
                  <CardDescription>
                    {manuscript.reviewers.filter(r => r.status === 'completed').length === manuscript.reviewers.length
                      ? "All reviews are complete and rewards have been automatically distributed to reviewers."
                      : isDeadlinePassed
                        ? "Deadline has passed. You can finalize the review process now."
                        : "Wait for all reviewers to complete their reviews or finalize after deadline."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {manuscript.reviewers.filter(r => r.status === 'completed').length === manuscript.reviewers.length ? (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleFinalizeReview}
                      disabled={isFinalizing}
                    >
                      {isFinalizing ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Finalizing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Finalize Review Process
                        </>
                      )}
                    </Button>
                  ) : isDeadlinePassed ? (
                    <Button
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={handleDeadlineFinalization}
                      disabled={isFinalizing}
                    >
                      {isFinalizing ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Finalizing...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Finalize Due to Deadline
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-gray-400 text-white"
                      disabled={true}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Waiting for Reviews
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {manuscript.reviewers.filter(r => r.status === 'completed').length === manuscript.reviewers.length
                      ? "Rewards have already been automatically distributed. Finalization only updates the manuscript status."
                      : isDeadlinePassed
                        ? "This will finalize the review process. Incomplete reviewers may face token slashing."
                        : "Cannot finalize until all reviews are complete or deadline passes"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
