import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";
import Timeline from "./pages/Timeline";
import Review from "./pages/Review";
import Submission from "./pages/Submission";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register"

import { WalletProvider } from "./context/WalletContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Wallet } from "lucide-react";
import { ContractProvider } from "./context/ContractContext";
import { TokenProvider } from "./context/TokenContext";


const queryClient = new QueryClient();

const App = () => (


  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WalletProvider>
            <ContractProvider>

              <TokenProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/timeline" element={<Timeline />} />
                  <Route path="/review/:manuscriptId" element={<Review />} />

                  <Route path="/submission" element={<Submission />} />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TokenProvider>
            </ContractProvider>

          </WalletProvider>
        </AuthProvider>

      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider >
);

export default App;
