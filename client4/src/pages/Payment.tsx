import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, CreditCard, Wallet, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Payment = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const tokenPackages = [
    {
      id: "starter",
      name: "Starter Package",
      tokens: 100,
      price: 25,
      description: "Perfect for new researchers",
      features: ["100 AXON tokens", "2 manuscript submissions", "Basic reputation tracking"]
    },
    {
      id: "researcher",
      name: "Researcher Package",
      tokens: 500,
      price: 100,
      description: "For active researchers",
      features: ["500 AXON tokens", "10 manuscript submissions", "Priority reviewer matching", "Advanced analytics"]
    },
    {
      id: "institution",
      name: "Institution Package",
      tokens: 2000,
      price: 350,
      description: "For research institutions",
      features: ["2000 AXON tokens", "Unlimited submissions", "Custom reviewer pools", "Institutional dashboard", "Priority support"]
    }
  ];

  const handlePurchase = () => {
    // TODO: Implement Stripe payment processing
    console.log("Processing payment for:", selectedPlan);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Token Packages</h1>
            <p className="text-muted-foreground">Choose the right package for your research needs</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {tokenPackages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`cursor-pointer transition-all duration-300 ${
                selectedPlan === pkg.id 
                  ? "border-primary shadow-neural scale-105" 
                  : "hover:border-primary/50 hover:shadow-lg"
              }`}
              onClick={() => setSelectedPlan(pkg.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <Badge variant="secondary" className="bg-gradient-neural text-white">
                    Popular
                  </Badge>
                </div>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Coins className="h-6 w-6 text-primary" />
                      <span className="text-2xl font-bold">{pkg.tokens}</span>
                      <span className="text-muted-foreground">AXON</span>
                    </div>
                    <div className="text-3xl font-bold">${pkg.price}</div>
                    <div className="text-sm text-muted-foreground">One-time purchase</div>
                  </div>
                  
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedPlan && (
          <Card className="max-w-md mx-auto border-primary/20 shadow-neural">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <CardDescription>Complete your token purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span>Selected Package:</span>
                  <span className="font-semibold">
                    {tokenPackages.find(p => p.id === selectedPlan)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span>Total Amount:</span>
                  <span className="text-xl font-bold">
                    ${tokenPackages.find(p => p.id === selectedPlan)?.price}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handlePurchase} 
                className="w-full" 
                variant="neural"
                size="lg"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Purchase with Stripe
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Secure payment processing • 30-day money back guarantee
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Payment;