import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, Clock, Trophy, Coins, Users, FileText } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}

export const StatsCard = ({ title, value, description, icon, trend }: StatsCardProps) => {
  return (
    <Card className="bg-gradient-card shadow-card hover:shadow-neural transition-all duration-300 transform hover:scale-105">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-axon-neural">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <Badge variant="secondary" className="mt-2 text-xs">
            {trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

interface ReputationCardProps {
  score: number;
  rank: string;
  reviews: number;
  expertise: string[];
}

export const ReputationCard = ({ score, rank, reviews, expertise }: ReputationCardProps) => {
  return (
    <Card className="bg-gradient-card shadow-card border-l-4 border-axon-neural">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-axon-neural" />
          Reputation Score
        </CardTitle>
        <CardDescription>Your on-chain scientific reputation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-axon-neural mb-2">{score}</div>
          <Badge variant="outline" className="border-axon-neural text-axon-neural">
            {rank} Reviewer
          </Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Reviews Completed: {reviews}</p>
          <Progress value={(score / 1000) * 100} className="h-2" />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Expertise Areas:</p>
          <div className="flex flex-wrap gap-1">
            {expertise.map((area, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface TokenBalanceProps {
  staked: number;
  available: number;
  earned: number;
  symbol: string;
}

export const TokenBalance = ({ staked, available, earned, symbol }: TokenBalanceProps) => {
  return (
    <Card className="bg-gradient-blockchain shadow-blockchain text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Coins className="h-5 w-5" />
          Token Balance
        </CardTitle>
        <CardDescription className="text-white/80">Your AXON token holdings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{available}</div>
            <div className="text-sm text-white/80">Available</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{staked}</div>
            <div className="text-sm text-white/80">Staked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-300">{earned}</div>
            <div className="text-sm text-white/80">Earned</div>
          </div>
        </div>
        <div className="pt-4 border-t border-white/20">
          <p className="text-center text-white/80 text-sm">Total: {available + staked + earned} {symbol}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardStats = () => {
  const statsData = [
    {
      title: "Active Reviews",
      value: "3",
      description: "Currently assigned",
      icon: <FileText className="h-4 w-4" />,
      trend: "+1 this week",
    },
    {
      title: "Avg Review Time",
      value: "4.2d",
      description: "Below 5d target",
      icon: <Clock className="h-4 w-4" />,
      trend: "-0.5d improvement",
    },
    {
      title: "Network Peers",
      value: "1,247",
      description: "Active reviewers",
      icon: <Users className="h-4 w-4" />,
      trend: "+12% this month",
    },
    {
      title: "Quality Rating",
      value: "4.8/5",
      description: "Peer feedback",
      icon: <Star className="h-4 w-4" />,
      trend: "Excellent",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};