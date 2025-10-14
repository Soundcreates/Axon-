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
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useContracts } from "@/context/ContractContext";
import { useWallet } from "@/context/WalletContext";
import { toast } from "sonner";
import { TokenDebug } from "@/components/debug/TokenDebug";
import { server } from "@/service/backendApi";

type User = {
  walletAddress: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  role: string;
  rep?: number;

}

const Dashboard = () => {
  const { user } = useAuth();
  const contracts = useContracts();
  const { account, status: walletStatus } = useWallet();

  //states type shi
  const [tokenBalanceOf, setTokenBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true);
  const [hasTriedWelcomeTokens, setHasTriedWelcomeTokens] = useState<boolean>(false);
  const [hasReceivedWelcomeTokens, setHasReceivedWelcomeTokens] = useState<boolean>(false);

  // Destructure from contracts context
  const {
    axonToken_balanceOf,
    axonToken_giveWelcomeTokens,
    isLoading: contractsLoading,
    networkSupported,
    axonTokenContract
  } = contracts || {};

  useEffect(() => {
    const fetchTokenBalance = async () => {
      console.log('Fetching acc balance');
      console.log('Account:', account);
      console.log('TokenBalance function available:', !!axonToken_balanceOf);
      console.log('Contracts loading:', contractsLoading);
      console.log('Network supported:', networkSupported);

      if (!account) {
        console.log("No account available yet");
        setIsLoadingBalance(false);
        return;
      }

      if (!axonToken_balanceOf || !networkSupported) {
        console.log("TokenBalance function not available yet or network not supported");
        return;
      }

      try {
        console.log("Account found, fetching token balance for:", account);
        const balance = await axonToken_balanceOf(account);

        // Convert BigInt to number properly (assuming 18 decimals)
        const balanceNumber = Number(balance) / (10 ** 18);
        console.log("Raw balance:", balance.toString());
        console.log("Formatted balance:", balanceNumber);
        setTokenBalance(balanceNumber);
      } catch (error) {
        console.error("Error fetching token balance:", error);
      } finally {
        setIsLoadingBalance(false);
      }
    }

    fetchTokenBalance();
  }, [account, axonToken_balanceOf, contractsLoading, networkSupported]);

  // Check if user has already received welcome tokens
  useEffect(() => {
    const checkWelcomeTokenStatus = async () => {
      if (!axonTokenContract || !account || !networkSupported) return;

      try {
        const hasReceived = await (axonTokenContract as any).hasReceivedWelcomeTokens(account);
        setHasReceivedWelcomeTokens(hasReceived);
        console.log("Has received welcome tokens:", hasReceived);
      } catch (error) {
        console.error("Error checking welcome token status:", error);
      }
    };

    checkWelcomeTokenStatus();
  }, [axonTokenContract, account, networkSupported]);

  // Separate useEffect for welcome tokens (only run once)
  useEffect(() => {
    const handleWelcomeTokens = async () => {
      console.log("Checking and sending welcome tokens if applicable...");
      if (!account) {

      }

      if (!account || !axonToken_giveWelcomeTokens || hasTriedWelcomeTokens || contractsLoading || !networkSupported) {
        console.log("Conditions not met for welcome tokens:", {
          account: !!account,
          giveWelcomeTokens: !!axonToken_giveWelcomeTokens,
          hasTriedWelcomeTokens,
          contractsLoading,
          networkSupported
        });
        return;
      }

      setHasTriedWelcomeTokens(true);

      try {
        const tx = await axonToken_giveWelcomeTokens();
        console.log("Welcome tokens transaction:", tx);

        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log("Welcome tokens transaction mined:", receipt);

        toast.success("Welcome tokens sent to your account!");
        console.log("Tokens sent successfully");

        // Refresh balance after successful token send
        setTimeout(async () => {
          if (axonToken_balanceOf) {
            try {
              const balance = await axonToken_balanceOf(account);
              const balanceNumber = Number(balance) / (10 ** 18);
              setTokenBalance(balanceNumber);
            } catch (error) {
              console.error("Error refreshing balance:", error);
            }
          }
        }, 2000);

      } catch (err) {
        console.error("Error sending welcome tokens: ", err);
        if (err instanceof Error && err.message.includes('already received')) {
          console.log("User already received welcome tokens");
        } else {
          console.log("Failed to send welcome tokens");
        }
      }
    }

    // Only run if wallet is connected and we haven't tried yet
    if (walletStatus === 'connected' && account && axonToken_giveWelcomeTokens && !hasTriedWelcomeTokens && !contractsLoading && networkSupported) {
      handleWelcomeTokens();
    }
  }, [account, axonToken_giveWelcomeTokens, walletStatus, hasTriedWelcomeTokens, contractsLoading, axonToken_balanceOf, networkSupported]);

  useEffect(() => {
    if (user) {
      console.log("user role is: ", user.role);
    } else {
      console.log("User hasnt loaded in!")
    }
  }, [])
  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState({
    reputation: 0,
    totalReviews: 0,
    activeReviews: 0,
    avgReviewTime: 0,
    qualityRating: 0,
    recentActivity: [],
    expertise: [],
    totalTokens: 0,
    stakedTokens: 0,
    earnedTokens: 0,
    networkPeers: 0,
    rank: 'Novice'
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await server.get('/user/dashboard-stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (response.data.success) {
          setDashboardStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Keep default values if fetch fails
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  // Fallback user data structure for compatibility
  const userData = {
    name: user?.name,
    rep: dashboardStats.reputation,
    totalTokens: dashboardStats.totalTokens,
    pendingReviews: dashboardStats.activeReviews,
    recentActivity: dashboardStats.recentActivity
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
                    <span className="hidden sm:block">{user?.username}</span>
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
              <h1 className="text-3xl font-bold">Welcome back, {user?.name} </h1>
              <p className="text-muted-foreground">Manage your research submissions and peer reviews</p>
            </div>
            <div className="flex gap-2">
              {
                user?.role === "author" &&
                (
                  <Link to="/submission">
                    <Button variant="neural">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Manuscript
                    </Button>
                  </Link>

                )
              }

              <Link to="/payment">
                <Button variant="outline-neural">
                  Buy Tokens
                </Button>
              </Link>

            </div>
          </div>
        </div>

        {/* Token Status Section */}
        {!networkSupported && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-yellow-800 font-medium">Network Issue</p>
                  <p className="text-yellow-700 text-sm">Please connect to Sepolia testnet to use token features</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {networkSupported && account && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-blue-800 font-medium">Wallet Connected</p>
                    <p className="text-blue-700 text-sm">Account: {account.slice(0, 6)}...{account.slice(-4)}</p>
                    <p className="text-blue-700 text-sm">Balance: {tokenBalanceOf.toFixed(2)} AXON tokens</p>
                    <p className="text-blue-700 text-sm">
                      Welcome tokens: {hasReceivedWelcomeTokens ? "✅ Received" : "❌ Not received"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (axonToken_balanceOf && account) {
                        try {
                          const balance = await axonToken_balanceOf(account);
                          const balanceNumber = Number(balance) / (10 ** 18);
                          setTokenBalance(balanceNumber);
                          toast.success("Balance refreshed!");
                        } catch (error) {
                          console.error("Error refreshing balance:", error);
                          toast.error("Failed to refresh balance");
                        }
                      }
                    }}
                    disabled={isLoadingBalance}
                  >
                    {isLoadingBalance ? "Loading..." : "Refresh"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (axonToken_giveWelcomeTokens && account) {
                        try {
                          const tx = await axonToken_giveWelcomeTokens();
                          console.log("Manual welcome tokens transaction:", tx);

                          const receipt = await tx.wait();
                          console.log("Manual welcome tokens transaction mined:", receipt);

                          toast.success("Welcome tokens claimed successfully!");

                          // Update status
                          setHasReceivedWelcomeTokens(true);

                          // Refresh balance
                          setTimeout(async () => {
                            if (axonToken_balanceOf) {
                              const balance = await axonToken_balanceOf(account);
                              const balanceNumber = Number(balance) / (10 ** 18);
                              setTokenBalance(balanceNumber);
                            }
                          }, 2000);
                        } catch (error) {
                          console.error("Error claiming welcome tokens:", error);
                          if (error instanceof Error && error.message.includes('already received')) {
                            toast.error("You have already received welcome tokens");
                            setHasReceivedWelcomeTokens(true);
                          } else {
                            toast.error("Failed to claim welcome tokens");
                          }
                        }
                      }
                    }}
                    disabled={contractsLoading || hasReceivedWelcomeTokens}
                  >
                    {contractsLoading ? "Loading..." : hasReceivedWelcomeTokens ? "Already Claimed" : "Claim Welcome Tokens"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Stats */}
        <DashboardStats stats={dashboardStats} isLoading={isLoadingStats} />

        {/* Token and Reputation Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <TokenBalance
            staked={dashboardStats.stakedTokens}
            available={tokenBalanceOf}
            earned={dashboardStats.earnedTokens}
            symbol="AXON"
          />
          <ReputationCard
            score={dashboardStats.reputation}
            rank={dashboardStats.rank}
            reviews={dashboardStats.totalReviews}
            expertise={dashboardStats.expertise.length > 0 ? dashboardStats.expertise : ["General Reviewer"]}
          />
        </div>

        {/* Debug Panel - Remove this in production */}
        <div className="mt-6">
          <TokenDebug />
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
                    <span className="text-sm">Quality Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{dashboardStats.qualityRating.toFixed(1)}</span>
                    <span className="text-muted-foreground text-sm">/5.0</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Avg Review Time</span>
                  </div>
                  <span className="font-bold text-green-600">{dashboardStats.avgReviewTime}d</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Total Reviews</span>
                  </div>
                  <span className="font-bold">{dashboardStats.totalReviews}</span>
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