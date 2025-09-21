import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Star, 
  Trophy, 
  Coins, 
  FileText, 
  Users,
  ArrowLeft,
  Edit,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  // Mock user data - will be fetched from Supabase
  const userData = {
    name: "Dr. Sarah Chen",
    email: "sarah.chen@stanford.edu",
    institution: "Stanford University",
    department: "Computer Science",
    joinDate: "March 2024",
    reputation: 4.8,
    totalReviews: 47,
    tokensEarned: 1250,
    currentTokens: 890,
    expertise: ["Machine Learning", "Neural Networks", "Computer Vision"],
    stats: {
      manuscriptsSubmitted: 12,
      reviewsCompleted: 47,
      averageReviewTime: "3.2 days",
      onTimeDelivery: 96
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground">Manage your researcher profile</p>
            </div>
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-primary/20 shadow-neural">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback className="text-lg bg-gradient-neural text-white">
                    SC
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{userData.name}</CardTitle>
                <CardDescription className="space-y-1">
                  <div className="flex items-center gap-2 justify-center">
                    <Mail className="h-4 w-4" />
                    {userData.email}
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <MapPin className="h-4 w-4" />
                    {userData.institution}
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Calendar className="h-4 w-4" />
                    Joined {userData.joinDate}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full mb-4">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                
                {/* Reputation Score */}
                <div className="p-4 bg-secondary/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold">{userData.reputation}</span>
                    <span className="text-muted-foreground">/5.0</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Reputation Score</p>
                  <Progress value={userData.reputation * 20} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            {/* Expertise Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expertise Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {userData.expertise.map((area) => (
                    <Badge key={area} variant="secondary" className="bg-axon-science/10 text-axon-science">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Balance */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  Token Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-neural/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{userData.currentTokens}</div>
                    <p className="text-sm text-muted-foreground">Current AXON Tokens</p>
                  </div>
                  <div className="p-4 bg-gradient-blockchain/10 rounded-lg">
                    <div className="text-2xl font-bold text-axon-blockchain">{userData.tokensEarned}</div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link to="/payment">
                    <Button variant="neural" size="sm">
                      <Coins className="h-4 w-4 mr-2" />
                      Buy Tokens
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    Transaction History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Performance Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Manuscripts Submitted</span>
                      </div>
                      <span className="font-semibold">{userData.stats.manuscriptsSubmitted}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Reviews Completed</span>
                      </div>
                      <span className="font-semibold">{userData.stats.reviewsCompleted}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Average Review Time</span>
                      <span className="font-semibold text-green-600">{userData.stats.averageReviewTime}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>On-Time Delivery</span>
                      <div className="flex items-center gap-2">
                        <Progress value={userData.stats.onTimeDelivery} className="w-16" />
                        <span className="font-semibold text-green-600">{userData.stats.onTimeDelivery}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest contributions to the Axon network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Review completed for "Neural Network Optimization"</p>
                      <p className="text-xs text-muted-foreground">2 hours ago • +25 AXON tokens</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Manuscript submitted: "Advanced ML Techniques"</p>
                      <p className="text-xs text-muted-foreground">1 day ago • Under review</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Review assignment accepted</p>
                      <p className="text-xs text-muted-foreground">3 days ago • 50 AXON staked</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;