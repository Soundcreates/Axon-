import { DashboardStats, TokenBalance, ReputationCard } from "@/components/dashboard/DashboardCards";
import { ReviewQueue } from "@/components/dashboard/ReviewQueue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  TrendingUp, 
  Users, 
  Clock,
  Star,
  Settings,
  LogOut
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock user data - will be fetched from Supabase
  const userData = {
    name: "Dr. Sarah Chen",
    reputation: 4.8,
    totalTokens: 890,
    pendingReviews: 3,
    recentActivity: [
      { type: "submission", title: "Advanced Neural Networks", status: "under_review", date: "2 days ago" },
      { type: "review", title: "Quantum ML Applications", status: "completed", date: "1 week ago" },
      { type: "reward", title: "Review Quality Bonus", amount: "25 AXON", date: "1 week ago" }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold bg-gradient-neural bg-clip-text text-transparent">
                Axon
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/dashboard" className="text-primary font-medium">Dashboard</Link>
                <Link to="/submission" className="text-muted-foreground hover:text-primary">Submit</Link>
                <Link to="/timeline" className="text-muted-foreground hover:text-primary">Timeline</Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-neural rounded-full flex items-center justify-center text-white text-sm font-medium">
                      SC
                    </div>
                    <span className="hidden sm:block">{userData.name}</span>
                  </div>
                </Button>
              </Link>
              
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, Dr. Chen</h1>
              <p className="text-muted-foreground">Manage your research submissions and peer reviews</p>
            </div>
            <div className="flex gap-2">
              <Link to="/submission">
                <Button variant="neural">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Manuscript
                </Button>
              </Link>
              <Link to="/payment">
                <Button variant="outline-neural">
                  Buy Tokens
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Token and Reputation Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <TokenBalance 
            staked={150}
            available={740}
            earned={320}
            symbol="AXON"
          />
          <ReputationCard 
            score={850}
            rank="Expert"
            reviews={47}
            expertise={["Machine Learning", "Neural Networks", "Computer Vision"]}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          {/* Review Queue */}
          <div className="lg:col-span-2">
            <ReviewQueue />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm">Reputation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{userData.reputation}</span>
                    <span className="text-muted-foreground text-sm">/5.0</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">This Month</span>
                  </div>
                  <span className="font-bold text-green-600">+12%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Reviews</span>
                  </div>
                  <span className="font-bold">23</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Your latest platform interactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {userData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {activity.status || activity.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{activity.date}</span>
                      </div>
                      {activity.amount && (
                        <p className="text-xs text-green-600 font-medium">{activity.amount}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                <Link to="/timeline">
                  <Button variant="outline" size="sm" className="w-full">
                    <Clock className="h-4 w-4 mr-2" />
                    View Full Timeline
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;