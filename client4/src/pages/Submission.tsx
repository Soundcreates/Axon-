
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Users,
  Coins,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Info,
  Filter
} from "lucide-react";
import { Form, Link, useNavigate } from "react-router-dom";
import { server } from "@/service/backendApi";
import { useContracts } from "@/context/ContractContext";
import { useWallet } from "@/context/WalletContext";
import { ContractDebug } from "@/components/debug/ContractDebug";
import NetworkConfig from "@/components/NetworkConfig";
import { toast } from "sonner";
import { ethers } from "ethers";

interface Reviewer {
  _id: string;
  name: string;
  email: string;
  expertise?: string[];
  rep: number;
  walletAddress: string;
}

interface FormData {
  title: string;
  description: string;
  keywords: string;
  category: string;
  file: File | null;
  priority: "standard" | "urgent";
  selectedReviewers: string[];
  deadline: string;
}

const Submission = () => {

  const contractContext = useContracts();

  //importing the contract functions
  const {
    peerReview_submitManuscript,
    peerReview_assignReviewers,
    axonToken_giveWelcomeTokens,
    generateManuscriptId,
    networkSupported,
    currentNetwork,
    error: contractError
  } = contractContext;


  const { status: walletStatus, account, connectWallet } = useWallet();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    keywords: "",
    category: "",
    file: null as File | null,
    priority: "standard",
    selectedReviewers: [] as string[],
    deadline: ""
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [filteredReviewers, setFilteredReviewers] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const [fileHash, setFileHash] = useState<string>("");
  const [stakingAmount, setStakingAmount] = useState<number>(50);




  const categories = [
    "Machine Learning",
    "Computer Vision",
    "Natural Language Processing",
    "Robotics",
    "Quantum Computing",
    "Bioinformatics",
    "Cryptography",
    "Software Engineering"
  ];

  // Fetch reviewers from backend
  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        const response = await server.get('/user/reviewers', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (response.data.reviewers.length === 0) console.log("There are no reviewers");
        setReviewers(response.data.reviewers || []);
        setFilteredReviewers(response.data.reviewers || []);
      } catch (error) {
        console.error("Error fetching reviewers:", error);
        // Fallback mock data for now
        const mockReviewers = [
          { _id: "507f1f77bcf86cd799439011", name: "Dr. John Smith", email: "john@university.edu", expertise: ["Machine Learning", "AI"], rep: 95, walletAddress: "0x1234567890123456789012345678901234567890" },
          { _id: "507f1f77bcf86cd799439012", name: "Dr. Sarah Wilson", email: "sarah@tech.edu", expertise: ["Computer Vision"], rep: 88, walletAddress: "0x2345678901234567890123456789012345678901" },
          { _id: "507f1f77bcf86cd799439013", name: "Dr. Mike Johnson", email: "mike@research.org", expertise: ["NLP", "Deep Learning"], rep: 92, walletAddress: "0x3456789012345678901234567890123456789012" },
          { _id: "507f1f77bcf86cd799439014", name: "Dr. Emily Chen", email: "emily@ai.institute", expertise: ["Robotics", "ML"], rep: 90, walletAddress: "0x4567890123456789012345678901234567890123" }
        ];
        setReviewers(mockReviewers);
        setFilteredReviewers(mockReviewers);
      }
    };

    if (step === 3) {
      fetchReviewers();
    }
  }, [step]);

  useEffect(() => {
    const baseCost = 50;
    const priorityMultiplier = formData.priority === "urgent" ? 2 : 1;
    const reviewerCost = formData.selectedReviewers.length * 15;
    const newStakingAmount = (baseCost * priorityMultiplier + reviewerCost);
    setStakingAmount(newStakingAmount);
  }, [formData.priority, formData.selectedReviewers.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file: file }))
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.name.endsWith('.tex'))) {
      setFormData({ ...formData, file });
    }
  };

  const handleReviewerSelect = (reviewerId: string) => {
    const updatedSelection = formData.selectedReviewers.includes(reviewerId)
      ? formData.selectedReviewers.filter(id => id !== reviewerId)
      : [...formData.selectedReviewers, reviewerId];

    setFormData({ ...formData, selectedReviewers: updatedSelection });
  };

  const handleGetWelcomeTokens = async () => {
    if (!axonToken_giveWelcomeTokens || walletStatus !== "connected") {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      console.log("Getting welcome tokens...");
      const tx = await axonToken_giveWelcomeTokens();
      console.log("Welcome tokens transaction submitted:", tx.hash);

      toast.success("Getting welcome tokens... Please wait for confirmation.");

      await tx.wait();
      toast.success("Welcome tokens received! You can now submit manuscripts.");

      // Refresh the page or update state to reflect new balance
      window.location.reload();
    } catch (error: any) {
      console.error("Failed to get welcome tokens:", error);
      if (error.message?.includes("Already received")) {
        toast.error("You have already received welcome tokens");
      } else {
        toast.error(`Failed to get welcome tokens: ${error.message}`);
      }
    }
  };

  const filterReviewers = () => {
    // Placeholder function for filtering reviewers based on document category
    console.log("Filtering reviewers based on category:", formData.category);
    // This will be implemented later to filter based on expertise matching document category
  };

  const handleSubmit = async () => {

    //ERC 20 steps to stake / transfer tokens
    //Step 1- Assign allowance
    //Step 2- Approve the transaction
    //Step 3- Transfer the tokens
    //Note  - the number data type wont work, we must use bigint(amount.toString())

    setIsSubmitting(true);
    // TODO: implement main functionality
    if (step === 4) {
      try {
        // Pre-submission validation
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("You must be logged in to submit a manuscript. Please log in first.");
        }

        if (!formData.file) {
          throw new Error("No file selected");
        }

        console.log("File details: ", {
          name: formData.file.name,
          size: formData.file.size,
          type: formData.file.type,
        })

        //handling upload to ipfs
        let ipfsUpload;

        if (formData.file && formData.file.name) {
          console.log("Starting IPFS upload for file:", formData.file);
          const fileFormData = new FormData;
          fileFormData.append('file', formData.file);
          fileFormData.append('fileName', formData.file.name);

          console.log("Uploading to IPFS with token:", localStorage.getItem("token") ? "Token exists" : "No token");

          try {
            ipfsUpload = await server.post('/user/upload', fileFormData, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'multipart/form-data'
              }
            });
            console.log("IPFS upload response:", ipfsUpload);
          } catch (uploadError) {
            console.error("IPFS upload failed:", uploadError);
            throw new Error(`File upload failed: ${uploadError.response?.data?.message || uploadError.message}`);
          }
        } else {
          throw new Error("No file selected for upload");
        }


        if (ipfsUpload.status === 200 && ipfsUpload.data.success) {
          console.log("File submitted to Manuscript");
          //storing file hash into state
          console.log(ipfsUpload.data.ipfsHash);

          const uploadFileHash = ipfsUpload.data.ipfsHash;
          setFileHash(ipfsUpload.data.upload as string);
          //handling connecting with contract

          console.log("Submitting to blockchain..");

          const stakingAmountToWei = ethers.parseEther(stakingAmount.toString());

          // Check wallet connection
          if (walletStatus !== "connected" || !account) {
            throw new Error("Please connect your wallet to submit a manuscript.");
          }

          // Check network support
          if (!networkSupported) {
            throw new Error(`Network not supported. Please switch to Sepolia testnet or Hardhat local. Current network: ${currentNetwork || 'Unknown'}. Error: ${contractError || 'Network configuration error'}`);
          }

          // Check if we have the required contract functions
          if (!contractContext.axonToken_allowance || !contractContext.axonToken_approve) {
            throw new Error("Token contract functions not available");
          }

          if (!contractContext.peerReviewContract?.target) {
            throw new Error("PeerReview contract address not available");
          }

          // Check user token balance first
          const userBalance = await contractContext.axonToken_balanceOf(account);
          const balanceFormatted = ethers.formatEther(userBalance.toString());
          const requiredFormatted = ethers.formatEther(stakingAmountToWei.toString());

          console.log("User balance:", balanceFormatted, "AXON");
          console.log("Required amount:", requiredFormatted, "AXON");

          if (userBalance < stakingAmountToWei) {
            // If user has 0 balance, suggest getting welcome tokens
            if (userBalance === 0n) {
              const getTokensMessage = `You have no AXON tokens. Click the "Get Test Tokens" button to receive some.`;
              throw new Error(getTokensMessage);
            } else {
              throw new Error(`Insufficient token balance. You need ${requiredFormatted} AXON but have ${balanceFormatted} AXON`);
            }
          }

          //working on approving the token transfer first
          console.log("Allowing the process to transfer token successfully");

          // Check current allowance (owner, spender)
          const currentAllowance = await contractContext.axonToken_allowance(
            account,
            contractContext.peerReviewContract.target as string
          );

          console.log("Current allowance:", ethers.formatEther(currentAllowance.toString()));
          console.log("Required Amount:", ethers.formatEther(stakingAmountToWei.toString()));

          // Convert BigInt to bigint for comparison
          const allowanceAsBigint = BigInt(currentAllowance.toString());

          if (allowanceAsBigint < stakingAmountToWei) {
            console.log("Approving tokens...");
            try {
              const approveTx = await contractContext.axonToken_approve(
                contractContext.peerReviewContract.target as string,
                stakingAmountToWei
              );
              console.log("Approval transaction submitted:", approveTx.hash);
              await approveTx.wait();
              console.log("Token approval completed");

              // Re-check allowance after approval
              const newAllowance = await contractContext.axonToken_allowance(
                account,
                contractContext.peerReviewContract.target as string
              );
              console.log("New allowance after approval:", ethers.formatEther(newAllowance.toString()));
            } catch (approveError) {
              console.error("Token approval failed:", approveError);
              throw new Error(`Token approval failed: ${approveError.message}`);
            }
          } else {
            console.log("Sufficient allowance already exists");
          }
          // Add debugging information
          console.log("Contract context:", contractContext);
          console.log("Is contracts loaded:", contractContext.isLoading);
          console.log("Contract error:", contractContext.error);
          console.log("Peer review contract:", contractContext.peerReviewContract);
          console.log("Wallet status:", walletStatus);
          console.log("Wallet account:", account);

          // Add validation before calling the contract function
          if (!peerReview_submitManuscript) {
            throw new Error("Contract function not available. Please check your wallet connection.");
          }

          if (!contractContext.peerReviewContract) {
            throw new Error("Contract not initialized. Please ensure your wallet is connected and try again.");
          }

          console.log("About to call peerReview_submitManuscript with:", {
            uploadFileHash,
            title: formData.title,
            stakingAmount: ethers.formatEther(stakingAmountToWei.toString())
          });

          // Validate parameters before contract call
          if (!uploadFileHash || uploadFileHash.trim() === "") {
            throw new Error("Invalid IPFS hash");
          }

          if (!formData.title || formData.title.trim() === "") {
            throw new Error("Invalid manuscript title");
          }

          if (stakingAmountToWei <= 0n) {
            throw new Error("Invalid staking amount");
          }

          // Generate proper manuscript ID
          const manuscriptId = generateManuscriptId(uploadFileHash, account);
          console.log("Generated manuscript ID:", manuscriptId);

          // Assign reviewers to blockchain if we have selected reviewers with wallet addresses
          if (formData.selectedReviewers.length > 0) {
            try {
              // Get reviewer wallet addresses
              const selectedReviewerObjects = reviewers.filter(reviewer =>
                formData.selectedReviewers.includes(reviewer._id)
              );

              const reviewerWalletAddresses = selectedReviewerObjects
                .filter(reviewer => reviewer.walletAddress)
                .map(reviewer => reviewer.walletAddress);

              if (reviewerWalletAddresses.length > 0) {
                console.log("Assigning reviewers to blockchain:", reviewerWalletAddresses);
                await peerReview_assignReviewers(manuscriptId, reviewerWalletAddresses);
                console.log("Reviewers assigned to blockchain successfully");
              } else {
                console.log("No reviewer wallet addresses available for blockchain assignment");
              }
            } catch (assignError: any) {
              console.error("Failed to assign reviewers to blockchain:", assignError);
              toast.warning("Manuscript submitted but reviewer assignment to blockchain failed: " + assignError.message);
            }
          }



          // Try the contract call with detailed error handling
          let contractTx;
          try {
            console.log("Calling contract submitManuscript function...");
            contractTx = await peerReview_submitManuscript(
              uploadFileHash,
              formData.title,
              stakingAmountToWei
            );
          } catch (contractError: any) {
            console.error("Contract call failed:", contractError);

            // More specific error handling
            if (contractError.message?.includes("insufficient funds")) {
              throw new Error("Insufficient ETH for gas fees");
            } else if (contractError.message?.includes("execution reverted")) {
              throw new Error("Contract execution failed. Please check your token balance and allowances.");
            } else if (contractError.code === 'UNPREDICTABLE_GAS_LIMIT') {
              throw new Error("Transaction would fail. Possible issues: insufficient tokens, insufficient allowance, or contract error.");
            } else if (contractError.message?.includes("user rejected")) {
              throw new Error("Transaction was rejected by user");
            } else {
              throw new Error(`Contract call failed: ${contractError.message}`);
            }
          }

          // Add validation for the transaction result
          if (!contractTx) {
            throw new Error("Transaction failed. Contract function returned undefined.");
          }

          console.log("Contract transaction object:", contractTx);

          const receipt = await contractTx.wait();

          console.log("Blockchain transaction successful: ", contractTx);
          //saving manuscript details to backend database

          console.log("Saving manuscript details to off chain db");
          const manuscriptData = {
            title: formData.title,
            description: formData.description,
            keywords: formData.keywords,
            category: formData.category,
            ipfsHash: uploadFileHash,
            contentHash: uploadFileHash, // For blockchain compatibility
            selectedReviewers: formData.selectedReviewers,
            reviewerCount: formData.selectedReviewers.length,
            priority: formData.priority,
            stakingCost: stakingAmount,
            transactionHash: contractTx.hash,
            blockchainId: receipt.blockNumber || "pending",
            manuscriptId: manuscriptId, // Add the generated manuscript ID
            deadline: formData.deadline
          };

          console.log("Manuscript data to be saved:", manuscriptData);
          console.log("Using token for submission:", localStorage.getItem("token") ? "Token exists" : "No token");

          try {
            const manuscriptSave = await server.post("/manuscript/submit", manuscriptData, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });

            console.log("Manuscript save response:", manuscriptSave);

            if (manuscriptSave.status === 200 && manuscriptSave.data.success) {
              console.log("Manuscript saved to database!");
              toast.success("Manuscript submitted successfully!");

              setTimeout(() => {
                navigate("/timeline");
              }, 700);
            } else {
              throw new Error(`Manuscript save failed: ${manuscriptSave.data?.message || "Unknown error"}`);
            }
          } catch (saveError) {
            console.error("Manuscript save failed:", saveError);
            throw new Error(`Failed to save manuscript: ${saveError.response?.data?.message || saveError.message}`);
          }
        } else {
          throw new Error("failed to upload file to IPFS");
        }

      } catch (error: string | any | undefined) {
        console.error("Error during submission:", error);

        let errorMessage = "Submission failed. Please try again.";

        if (error.message?.includes("User denied")) {
          errorMessage = "Transaction was cancelled by user.";
        } else if (error.message?.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction.";
        } else if (error.message?.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message?.includes("Contract not initialized")) {
          errorMessage = "Please connect your wallet and try again.";
        } else if (error.message?.includes("Transaction failed")) {
          errorMessage = "Blockchain transaction failed. Please try again.";
        } else if (error.message?.includes("File upload failed")) {
          errorMessage = error.message;
        } else if (error.message?.includes("Failed to save manuscript")) {
          errorMessage = error.message;
        } else if (error.response?.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (error.response?.status === 403) {
          errorMessage = "Access denied. Please check your permissions.";
        } else if (error.response?.status === 404) {
          errorMessage = "Service not found. Please check if the server is running.";
        } else if (error.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);

      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 1:
        return formData.title.trim() !== "" && formData.description.trim() !== "" && formData.category !== "" && formData.deadline !== "";
      case 2:
        return formData.file !== null;
      case 3:
        return formData.selectedReviewers.length >= 1;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Debug Component - Remove this later */}

        <div className="flex items-center gap-4 mb-8 slide-down">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          {walletStatus === "connected" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetWelcomeTokens}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              <Coins className="h-4 w-4 mr-2" />
              Get Test Tokens
            </Button>
          )}
          {walletStatus === "connected" && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${networkSupported
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}>
              {networkSupported ? `Connected to ${currentNetwork}` : "Unsupported Network"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">Submit Manuscript</h1>
            <p className="text-muted-foreground">Submit your research for peer review on the Axon network</p>
          </div>
        </div>

        {/* Network Configuration */}
        <div className="mb-6">
          <NetworkConfig />
        </div>

        {/* Progress Steps */}
        <Card className="mb-8 slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Submission Progress</span>
              <span className="text-sm text-muted-foreground">{step}/4 steps</span>
            </div>
            <Progress value={(step / 4) * 100} className="mb-4" />
            <div className="grid grid-cols-4 gap-2">
              {["Manuscript Info", "File Upload", "Review Settings", "Confirmation"].map((stepName, index) => (
                <div key={index} className={`text-xs text-center p-2 rounded ${step > index + 1 ? "bg-green-100 text-green-700" :
                  step === index + 1 ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                  {stepName}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="space-y-6 slide-up">
          {step === 1 && (
            <Card className="border-primary/20 shadow-neural">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Manuscript Information
                </CardTitle>
                <CardDescription>Provide basic information about your research</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter your manuscript title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a comprehensive description of your research (250-500 words)"
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Research Category *</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords *</Label>
                    <Input
                      id="keywords"
                      placeholder="keyword1, keyword2, keyword3"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="space-y-2 w-full max-w-md">
                    <Label htmlFor="deadline">Deadline *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-primary/20 shadow-neural">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  File Upload
                </CardTitle>
                <CardDescription>Upload your manuscript file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                    ? "border-primary bg-primary/5"
                    : "border-primary/30 hover:border-primary/50"
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                  style={{ cursor: 'pointer', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {formData.file ? (
                    <div className="space-y-2">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                      <p className="font-medium">{formData.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, file: null });
                        }}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-lg font-medium">
                          {isDragging ? "Drop your file here" : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Supported formats: PDF, DOC, DOCX, TEX (Max 50MB)
                        </p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.tex"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">File Requirements:</p>
                      <ul className="mt-1 space-y-1 list-disc list-inside">
                        <li>Manuscript must be in final submission format</li>
                        <li>Include all figures, tables, and references</li>
                        <li>Remove author information for blind review</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-primary/20 shadow-neural">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Review Settings
                </CardTitle>
                <CardDescription>Configure your peer review preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Select Reviewers</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose reviewers for your manuscript
                    </p>
                  </div>
                  <Button variant="outline" onClick={filterReviewers}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter by Expertise
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReviewers.map((reviewer: any) => (
                    <Card
                      key={reviewer._id}
                      className={`cursor-pointer transition-all border ${formData.selectedReviewers.includes(reviewer._id)
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/50"
                        }`}
                      onClick={() => handleReviewerSelect(reviewer._id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{reviewer.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              Rep: {reviewer.rep}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{reviewer.email}</p>
                          <div className="flex flex-wrap gap-1">
                            {reviewer.expertise?.slice(0, 2).map((skill: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {reviewer.expertise?.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{reviewer.expertise.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Selected: {formData.selectedReviewers.length} reviewers
                </div>

                <div className="flex justify-center">
                  <div className="space-y-4 max-w-md">
                    <div>
                      <Label className="text-base font-medium">Priority Level</Label>
                      <p className="text-sm text-muted-foreground mb-3">Higher priority gets faster review assignment</p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="standard"
                            name="priority"
                            value="standard"
                            checked={formData.priority === "standard"}
                            onChange={() => setFormData({ ...formData, priority: "standard" })}
                          />
                          <label htmlFor="standard" className="text-sm">
                            Standard (14-21 days)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="urgent"
                            name="priority"
                            value="urgent"
                            checked={formData.priority === "urgent"}
                            onChange={() => setFormData({ ...formData, priority: "urgent" })}
                          />
                          <label htmlFor="urgent" className="text-sm">
                            Urgent (7-10 days) - 2x token cost
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-primary" />
                      <span className="font-medium">Total Staking Cost:</span>
                    </div>
                    <div className="text-xl font-bold text-primary">
                      {stakingAmount} AXON
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tokens will be staked until review completion. High-quality submissions receive token rewards.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card className="border-primary/20 shadow-neural">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Confirm Submission
                </CardTitle>
                <CardDescription>Review your submission details before finalizing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium">Manuscript Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Title:</span> {formData.title}</p>
                      <p><span className="font-medium">Category:</span> {formData.category}</p>
                      <p><span className="font-medium">Keywords:</span> {formData.keywords || "None provided"}</p>
                      <p><span className="font-medium">Deadline:</span> {formData.deadline}</p>
                      <p><span className="font-medium">File:</span> {formData.file?.name}</p>
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="mt-1 text-black text-xs bg-gray-50 p-2 rounded border max-h-20 overflow-y-auto">
                          {formData.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">Review Configuration</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Reviewers:</span> {formData.selectedReviewers.length}</p>
                      <p><span className="font-medium">Priority:</span> {formData.priority}</p>
                      <p><span className="font-medium">Tokens to Stake:</span> {stakingAmount} AXON</p>
                      <div>
                        <span className="font-medium">Selected Reviewers:</span>
                        <div className="mt-1 space-y-1">
                          {formData.selectedReviewers.map((reviewerId) => {
                            const reviewer = reviewers.find((r: any) => r._id === reviewerId);
                            return reviewer ? (
                              <div key={reviewerId} className="text-black text-xs bg-gray-50 p-1 rounded">
                                {reviewer.name} - {reviewer.email}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">Important Notice:</p>
                      <p className="mt-1">
                        By submitting, you agree to stake {stakingAmount} AXON tokens. Tokens will be returned upon successful review completion, with potential rewards for high-quality submissions.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                  variant="neural"
                  size="lg"
                >
                  {isSubmitting ? (
                    "Submitting to Blockchain..."
                  ) : (
                    <>
                      <Coins className="h-4 w-4 mr-2" />
                      Submit & Stake {stakingAmount} AXON
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceedToNextStep()}
                variant="neural"
              >
                Next Step
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submission;