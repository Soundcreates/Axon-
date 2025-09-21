import React from "react";
import { Link } from "react-router-dom";
import { HeroSection, FeaturesSection } from "@/components/home/HeroSection";
import { DashboardStats, ReputationCard, TokenBalance } from "@/components/dashboard/DashboardCards";
import { ReviewQueue } from "@/components/dashboard/ReviewQueue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Clock, 
  Award,
  Plus,
  Bell,
  User
} from "lucide-react";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background aurora">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/70 backdrop-blur-xl border-b border-border z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-neural rounded-2xl flex items-center justify-center shadow-neural">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-2xl font-bold text-foreground">Axon</span>
              <Badge className="bg-primary/10 text-primary border-primary/20 rounded-xl ml-2">
                DeSci Platform
              </Badge>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </a>
              <a href="#submit" className="text-muted-foreground hover:text-foreground transition-colors">
                Submit Paper
              </a>
              <a href="#reviews" className="text-muted-foreground hover:text-foreground transition-colors">
                Reviews
              </a>
              <a href="#reputation" className="text-muted-foreground hover:text-foreground transition-colors">
                Reputation
              </a>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="rounded-2xl">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-2xl" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="neural" size="sm" className="rounded-2xl shadow-glow">
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />
      
      {/* Features */}
      <FeaturesSection />
      
      {/* Dashboard Preview */}
      <section id="dashboard" className="py-24 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Your Research Dashboard
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Monitor your research impact, manage reviews, and track token rewards all in one comprehensive dashboard.
            </p>
          </div>
          
          <div className="rounded-3xl p-1 bg-card/40 border border-border backdrop-blur-xl shadow-glow mb-8">
            <Tabs defaultValue="overview" className="space-y-8 p-6">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-muted/30 border border-border rounded-2xl">
                <TabsTrigger value="overview" className="rounded-2xl">Overview</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-2xl">Reviews</TabsTrigger>
                <TabsTrigger value="reputation" className="rounded-2xl">Reputation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-8">
                <DashboardStats />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <ReviewQueue />
                  </div>
                  
                  <div className="space-y-6">
                    <TokenBalance 
                      available={1250}
                      staked={500}
                      earned={180}
                      symbol="AXON"
                    />
                    
                    <Card className="bg-card/80 backdrop-blur-xl border-border shadow-card rounded-3xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button variant="neural" className="w-full justify-start rounded-2xl shadow-neural">
                          <Plus className="h-4 w-4 mr-2" />
                          Submit New Paper
                        </Button>
                        <Button variant="outline-blockchain" className="w-full justify-start rounded-2xl bg-muted/20 border-secondary/30 hover:bg-secondary/10">
                          <FileText className="h-4 w-4 mr-2" />
                          Browse Open Reviews
                        </Button>
                        <Button variant="outline-neural" className="w-full justify-start rounded-2xl bg-muted/20 border-primary/30 hover:bg-primary/10">
                          <Award className="h-4 w-4 mr-2" />
                          Stake More Tokens
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <ReviewQueue />
              </TabsContent>
              
              <TabsContent value="reputation">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ReputationCard 
                    score={847}
                    rank="Expert"
                    reviews={23}
                    expertise={["Machine Learning", "Blockchain", "Cryptography"]}
                  />
                  
                  <Card className="bg-card/80 backdrop-blur-xl border-border shadow-card rounded-3xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Performance Analytics
                      </CardTitle>
                      <CardDescription>
                        Your review performance over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Average Review Time</span>
                          <Badge variant="secondary" className="rounded-xl">3.8 days</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Quality Score</span>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 rounded-xl">Excellent (4.9/5)</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Consistency Rating</span>
                          <Badge className="bg-secondary/20 text-secondary border-secondary/30 rounded-xl">Very High (96%)</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
