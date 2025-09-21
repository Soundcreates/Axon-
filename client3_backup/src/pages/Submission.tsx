import { useState } from "react";
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
  Info
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Submission = () => {
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    keywords: "",
    category: "",
    file: null as File | null,
    reviewerCount: 3,
    priority: "standard"
  });
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

  const calculateStakingCost = () => {
    const baseCost = 50;
    const reviewerMultiplier = formData.reviewerCount * 15;
    const priorityMultiplier = formData.priority === "urgent" ? 2 : 1;
    return (baseCost + reviewerMultiplier) * priorityMultiplier;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // TODO: Implement manuscript submission with Supabase
    // This would upload the file, create submission record, stake tokens
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/timeline");
    }, 3000);
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 1:
        return formData.title && formData.abstract && formData.keywords && formData.category;
      case 2:
        return formData.file;
      case 3:
        return true;
      default:
        return false;
    }
  };

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
          <div>
            <h1 className="text-3xl font-bold">Submit Manuscript</h1>
            <p className="text-muted-foreground">Submit your research for peer review on the Axon network</p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Submission Progress</span>
              <span className="text-sm text-muted-foreground">{step}/4 steps</span>
            </div>
            <Progress value={(step / 4) * 100} className="mb-4" />
            <div className="grid grid-cols-4 gap-2">
              {["Manuscript Info", "File Upload", "Review Settings", "Confirmation"].map((stepName, index) => (
                <div key={index} className={`text-xs text-center p-2 rounded ${
                  step > index + 1 ? "bg-green-100 text-green-700" :
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
        <div className="space-y-6">
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
                  <Label htmlFor="abstract">Abstract *</Label>
                  <Textarea
                    id="abstract"
                    placeholder="Provide a comprehensive abstract of your research (250-500 words)"
                    rows={6}
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
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
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
                  {formData.file ? (
                    <div className="space-y-2">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                      <p className="font-medium">{formData.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button variant="outline" onClick={() => setFormData({ ...formData, file: null })}>
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Button variant="outline" asChild>
                            <span>Choose File</span>
                          </Button>
                          <input
                            id="file-upload"
                            type="file"
                            accept=".pdf,.doc,.docx,.tex"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Supported formats: PDF, DOC, DOCX, TEX (Max 50MB)
                      </p>
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
                              onChange={() => setFormData({ ...formData, reviewerCount: count })}
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
                      <p><span className="font-medium">Keywords:</span> {formData.keywords}</p>
                      <p><span className="font-medium">File:</span> {formData.file?.name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">Review Configuration</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Reviewers:</span> {formData.reviewerCount}</p>
                      <p><span className="font-medium">Priority:</span> {formData.priority}</p>
                      <p><span className="font-medium">Tokens to Stake:</span> {calculateStakingCost()} AXON</p>
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