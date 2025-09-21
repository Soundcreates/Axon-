import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Clock, 
  User, 
  Award, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  ExternalLink
} from "lucide-react";

interface ReviewItemProps {
  id: string;
  title: string;
  authors: string[];
  submittedDate: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  field: string;
  stakeAmount: number;
  priority: "high" | "medium" | "low";
}

const ReviewItem = ({ 
  id, 
  title, 
  authors, 
  submittedDate, 
  dueDate, 
  status, 
  field, 
  stakeAmount, 
  priority 
}: ReviewItemProps) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    "in-progress": "bg-blue-100 text-blue-800 border-blue-200", 
    completed: "bg-green-100 text-green-800 border-green-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
  };

  const priorityColors = {
    high: "border-red-500",
    medium: "border-yellow-500", 
    low: "border-green-500",
  };

  return (
    <Card className={`bg-gradient-card shadow-card hover:shadow-neural transition-all duration-300 border-l-4 ${priorityColors[priority]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 mb-2">
              {title}
            </CardTitle>
            <CardDescription className="text-sm">
              <span className="font-medium">Authors:</span> {authors.join(", ")}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`text-xs ${statusColors[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {field}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Due: {dueDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Stake: {stakeAmount} AXON</span>
          </div>
        </div>
        
        <Separator className="mb-4" />
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            ID: {id}
          </div>
          <div className="flex gap-2">
            <Button variant="outline-neural" size="sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Paper
            </Button>
            {status === "pending" && (
              <Button variant="neural" size="sm">
                Start Review
              </Button>
            )}
            {status === "in-progress" && (
              <Button variant="blockchain" size="sm">
                Continue
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ReviewQueue = () => {
  const sampleReviews: ReviewItemProps[] = [
    {
      id: "AXN-2024-001",
      title: "Novel Approaches to Quantum Error Correction Using Machine Learning Algorithms",
      authors: ["Dr. Sarah Chen", "Prof. Michael Rodriguez", "Dr. Aisha Patel"],
      submittedDate: "2024-01-15",
      dueDate: "2024-01-22",
      status: "in-progress",
      field: "Quantum Computing",
      stakeAmount: 100,
      priority: "high",
    },
    {
      id: "AXN-2024-002", 
      title: "Blockchain-Based Supply Chain Transparency in Pharmaceutical Manufacturing",
      authors: ["Dr. James Wilson", "Dr. Lisa Thompson"],
      submittedDate: "2024-01-18",
      dueDate: "2024-01-25",
      status: "pending",
      field: "Supply Chain",
      stakeAmount: 75,
      priority: "medium",
    },
    {
      id: "AXN-2024-003",
      title: "Deep Learning Applications in Climate Change Prediction Models",
      authors: ["Prof. Elena Volkov", "Dr. David Kim", "Research Team Alpha"],
      submittedDate: "2024-01-10",
      dueDate: "2024-01-20",
      status: "completed",
      field: "Climate Science",
      stakeAmount: 120,
      priority: "high",
    },
  ];

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-axon-neural" />
          Review Queue
        </CardTitle>
        <CardDescription>
          Your assigned peer review tasks and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sampleReviews.map((review) => (
            <ReviewItem key={review.id} {...review} />
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Total Active Reviews: {sampleReviews.filter(r => r.status !== "completed").length}
            </div>
            <Button variant="outline-neural" size="sm">
              View All Reviews
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};