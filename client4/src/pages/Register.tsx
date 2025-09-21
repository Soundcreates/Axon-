import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "@/context/WalletContext";
import { toast } from "sonner";
import { server } from "@/service/backendApi";

type FormData = {
  name: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { account, connectWallet, status } = useWallet();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
    password: "",
    role: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonClicked, setButtonClicked] = useState<string>("");

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle role selection
  const handleRoleSelect = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }
    if (!formData.role) {
      toast.error("Please select a role");
      return false;
    }
    if (!account) {
      toast.error("Please connect your wallet first");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const registrationData = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        walletAddress: account
      };

      const response = await server.post('/auth/register', registrationData);

      if (response.status === 200) {
        toast.success("Registration successful! Redirecting to dashboard...");

        // Store the token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirect to dashboard after a brief delay
        navigate("/dashboard");

      } else {
        toast.error(response.data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-neural bg-clip-text text-transparent mb-2">
            Axon
          </h1>
          <p className="text-muted-foreground">
            Decentralized Scientific Peer Review
          </p>
        </div>

        <Card className="border-primary/20 shadow-neural">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">
              Create your research account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Shantanav Mukherjee"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="aryanlomte06"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="aditya@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter your password (min. 6 characters)"
                  required
                />
              </div>

              {/* Wallet Connection */}
              <div className="space-y-2">
                <Label>Wallet Connection</Label>
                {account ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      Connected: {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handleConnectWallet}
                    disabled={status === "connecting"}
                    className="w-full"
                    variant="outline"
                  >
                    {status === "connecting" ? "Connecting..." : "Connect Wallet"}
                  </Button>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Select Role</Label>
                <div className="flex justify-center items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => handleRoleSelect("reviewer")}
                    className={`flex-1 transition-all duration-300 ${formData.role === "reviewer"
                      ? "bg-slate-950 text-white"
                      : "bg-primary hover:bg-primary/90"
                      }`}
                  >
                    Reviewer
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleRoleSelect("author")}
                    className={`flex-1 transition-all duration-300 ${formData.role === "author"
                      ? "bg-slate-950 text-white"
                      : "bg-primary hover:bg-primary/90"
                      }`}
                  >
                    Author
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="neural"
                disabled={isSubmitting || !account}
              >
                {isSubmitting ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in!
                </Link>
              </p>
              <Link to="/" className="text-sm text-muted-foreground hover:underline block">
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;