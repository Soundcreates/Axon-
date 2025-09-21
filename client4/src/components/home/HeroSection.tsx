import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Award, Network, FileCheck, Coins } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Futuristic scientific research with blockchain networks" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center text-white">
        <Badge className="bg-white/20 text-white border-white/30 mb-6">
          <Zap className="h-3 w-3 mr-1" />
          Decentralized Science Revolution
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Axon
          </span>
          <br />
          <span className="text-3xl md:text-5xl font-normal">
            Transparent Peer Review
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
          Revolutionary blockchain platform transforming academic peer review through 
          tokenized incentives, transparent workflows, and on-chain reputation systems.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link to="/login">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              Join the Network
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline-neural" size="lg" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-axon-neural">
              Enter Dashboard
            </Button>
          </Link>
        </div>
        
        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">2.4k+</div>
            <div className="text-blue-200">Active Reviewers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">15M+</div>
            <div className="text-blue-200">AXON Tokens Staked</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">98%</div>
            <div className="text-blue-200">Transparency Score</div>
          </div>
        </div>
      </div>
      
      {/* Floating elements animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-300/50 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-pulse delay-500" />
      </div>
    </section>
  );
};

export const FeaturesSection = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Smart Contract Security",
      description: "Entire peer review process managed by audited smart contracts, ensuring transparency and eliminating centralized control points.",
      gradient: "bg-gradient-neural",
    },
    {
      icon: <Coins className="h-8 w-8" />,
      title: "Token Incentives",
      description: "Reviewers stake AXON tokens and earn rewards for quality, timely reviews. Poor performance results in token slashing.",
      gradient: "bg-gradient-blockchain",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "On-Chain Reputation",
      description: "Immutable reputation system tracks all review activities, creating verifiable scientific contribution records.",
      gradient: "bg-axon-science",
    },
    {
      icon: <Network className="h-8 w-8" />,
      title: "AI Reviewer Matching",
      description: "Advanced algorithms match papers to optimal reviewers based on expertise, reputation, and availability.",
      gradient: "bg-gradient-neural",
    },
    {
      icon: <FileCheck className="h-8 w-8" />,
      title: "Transparent History",
      description: "Complete audit trail of submissions, reviews, and decisions stored immutably on-chain for full accountability.",
      gradient: "bg-gradient-blockchain",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Faster Processing",
      description: "Incentivized system reduces average review time from months to days while maintaining quality standards.",
      gradient: "bg-axon-science",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="bg-axon-neural/10 text-axon-neural border-axon-neural mb-4">
            Revolutionary Features
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            The Future of Scientific Review
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Axon leverages blockchain technology to solve the fundamental problems in academic peer review, 
            creating a transparent, efficient, and incentivized ecosystem for scientific validation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-gradient-card rounded-xl shadow-card hover:shadow-neural transition-all duration-300 transform hover:scale-105 border border-border/50"
            >
              <div className="p-8">
                <div className={`${feature.gradient} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};