
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
import { toast } from "sonner";

interface Reviewer {
  _id: string;
  name: string;
  email: string;
  expertise?: string[];
  rep: number;
}

interface FormData {
  title: string;
  description: string;
  keywords: string;
  category: string;
  file: File | null;
  reviewerCount: number;
  priority: "standard";
  selectedReviewers: string[];
}

const Submission = () => {

  const { peerReview_submitManuscript } = useContracts();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    keywords: "",
    category: "",
    file: null as File | null,
    reviewerCount: 3,
    priority: "standard",
    selectedReviewers: [] as string[]
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [filteredReviewers, setFilteredReviewers] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const [fileHash, setFileHash] = useState<string>("");




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
        const response = await server.get('/user/reviewers');
        if (response.data.reviewers.length === 0) console.log("There are no reviewers");
        setReviewers(response.data.reviewers || []);
        setFilteredReviewers(response.data.reviewers || []);
      } catch (error) {
        console.error("Error fetching reviewers:", error);
        // Fallback mock data for now
        const mockReviewers = [
          { _id: "1", name: "Dr. John Smith", email: "john@university.edu", expertise: ["Machine Learning", "AI"], rep: 95 },
          { _id: "2", name: "Dr. Sarah Wilson", email: "sarah@tech.edu", expertise: ["Computer Vision"], rep: 88 },
          { _id: "3", name: "Dr. Mike Johnson", email: "mike@research.org", expertise: ["NLP", "Deep Learning"], rep: 92 },
          { _id: "4", name: "Dr. Emily Chen", email: "emily@ai.institute", expertise: ["Robotics", "ML"], rep: 90 }
        ];
        setReviewers(mockReviewers);
        setFilteredReviewers(mockReviewers);
      }
    };

    if (step === 3) {
      fetchReviewers();
    }
  }, [step]);

  const calculateStakingCost = () => {
    const baseCost = 50;
    const reviewerMultiplier = formData.reviewerCount * 15;
    const priorityMultiplier = formData.priority === "urgent" ? 2 : 1;
    return (baseCost + reviewerMultiplier) * priorityMultiplier;
  };

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

  const filterReviewers = () => {
    // Placeholder function for filtering reviewers based on document category
    console.log("Filtering reviewers based on category:", formData.category);
    // This will be implemented later to filter based on expertise matching document category
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // TODO: implement main functionality
    if (step === 4) {
      try {

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
          console.log(formData.file);
          const fileFormData = new FormData;
          fileFormData.append('file', formData.file);
          fileFormData.append('fileName', formData.file.name);
          ipfsUpload = await server.post('/user/upload', fileFormData, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`,
            }
          })

        }


        if (ipfsUpload.status === 200 && ipfsUpload.data.success) {
          console.log("File submitted to Manuscript");
          //storing file hash into state
          console.log(ipfsUpload.data.ipfsHash);

          const uploadFileHash = ipfsUpload.data.ipfsHash;
          setFileHash(ipfsUpload.data.upload as string);
          //handling connecting with contract

          console.log("Submitting to blockchain..");

          const contractTx = await peerReview_submitManuscript(
            uploadFileHash,
            formData.title
          )

          const receipt = await contractTx.wait();

          console.log("Blockchain transaction successfull: ", contractTx);
          //saving manuscript details to backend database

          console.log("Saving manuscript details to off chain db");
          const manuscriptData = {
            title: formData.title,
            description: formData.description,
            keywords: formData.keywords,
            category: formData.category,
            ipfsHash: uploadFileHash,
            selectedReviewers: formData.selectedReviewers,
            reviewerCount: formData.reviewerCount,
            priority: formData.priority,
            stakingCost: calculateStakingCost(),
            transactionHash: contractTx.hash || contractTx.transactionhash,
            blockchainId: contractTx.blockNumber || "pending"
          };

          const manuscriptSave = await server.post("/manuscript/submit", manuscriptData, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,

            }
          });

          if (manuscriptSave.status == 200) {
            console.log("Manuscript saved to database!");
            toast.success("Manuscript submitted successfully!");

            setTimeout(() => {
              navigate("/timeline");
            }, 700);
          } else {
            throw new Error("failed to save manuscript!");
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
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
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
        return formData.title.trim() !== "" && formData.description.trim() !== "" && formData.category !== "";
      case 2:
        return formData.file !== null;
      case 3:
        return formData.selectedReviewers.length >= formData.reviewerCount;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8 slide-down">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Submit Manuscript</h1>
            <p className="text-muted-foreground">Submit your research for peer review on the Axon network</p>
          </div>
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
                      Choose {formData.reviewerCount} reviewers for your manuscript
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
                  Selected: {formData.selectedReviewers.length} / {formData.reviewerCount} reviewers
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Number of Reviewers</Label>
                      <p className="text-sm text-muted-foreground mb-3">More reviewers provide better feedback but cost more tokens</p>
                      <div className="space-y-2">
                        {[2, 3, 4, 5].map((count) => (
                          <div key={count} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`reviewers-${count}`}
                              name="reviewers"
                              value={count}
                              checked={formData.reviewerCount === count}
                              onChange={() => {
                                setFormData({
                                  ...formData,
                                  reviewerCount: count,
                                  selectedReviewers: formData.selectedReviewers.slice(0, count)
                                });
                              }}
                            />
                            <label htmlFor={`reviewers-${count}`} className="text-sm">
                              {count} reviewers ({50 + count * 15} AXON tokens)
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
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
                      {calculateStakingCost()} AXON
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
                      <p><span className="font-medium">Reviewers:</span> {formData.reviewerCount}</p>
                      <p><span className="font-medium">Priority:</span> {formData.priority}</p>
                      <p><span className="font-medium">Tokens to Stake:</span> {calculateStakingCost()} AXON</p>
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
                        By submitting, you agree to stake {calculateStakingCost()} AXON tokens. Tokens will be returned upon successful review completion, with potential rewards for high-quality submissions.
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
                      Submit & Stake {calculateStakingCost()} AXON
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