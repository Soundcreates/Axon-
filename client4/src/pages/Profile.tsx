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

            {/* Research Achievements */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Research Achievements
                </CardTitle>
                <CardDescription>Milestones in decentralized peer review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-800 dark:text-green-200">Expert Reviewer</span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300">Completed 25+ high-quality reviews</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Quality Contributor</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Maintained 4.8+ review rating</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold text-purple-800 dark:text-purple-200">Community Builder</span>
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300">Referred 5+ researchers to platform</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold text-orange-800 dark:text-orange-200">Token Holder</span>
                    </div>
                    <p className="text-xs text-orange-700 dark:text-orange-300">Accumulated 1000+ AXON tokens</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest contributions to the Axon DeSci network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Peer review completed: "Neural Network Optimization in Blockchain Systems"</p>
                      <p className="text-xs text-muted-foreground">2 hours ago • +25 AXON tokens • Quality: 4.9/5</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Research paper submitted: "Advanced ML Techniques for DeSci Applications"</p>
                      <p className="text-xs text-muted-foreground">1 day ago • Under peer review • 2/3 reviewers assigned</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Review assignment accepted for AI Ethics research</p>
                      <p className="text-xs text-muted-foreground">3 days ago • 50 AXON tokens staked • Deadline: 5 days remaining</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Expertise verification completed for "Machine Learning" domain</p>
                      <p className="text-xs text-muted-foreground">5 days ago • Domain reputation increased to Expert level</p>
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