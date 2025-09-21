import React from "react";
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
  Bell
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-neural rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-2xl font-bold text-foreground">Axon</span>
              <Badge className="bg-axon-neural/10 text-axon-neural border-axon-neural ml-2">
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
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="neural" size="sm">
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
      <section id="dashboard" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Your Research Dashboard
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Monitor your research impact, manage reviews, and track token rewards all in one comprehensive dashboard.
            </p>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="reputation">Reputation</TabsTrigger>
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
                  
                  <Card className="bg-gradient-card shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-axon-neural" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="neural" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Submit New Paper
                      </Button>
                      <Button variant="outline-blockchain" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Browse Open Reviews
                      </Button>
                      <Button variant="outline-neural" className="w-full justify-start">
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
                
                <Card className="bg-gradient-card shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-axon-neural" />
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
                        <Badge variant="secondary">3.8 days</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Quality Score</span>
                        <Badge className="bg-green-100 text-green-800">Excellent (4.9/5)</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Consistency Rating</span>
                        <Badge className="bg-blue-100 text-blue-800">Very High (96%)</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Index;
