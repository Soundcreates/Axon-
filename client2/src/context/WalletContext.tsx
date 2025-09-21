import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ethers, BrowserProvider, Signer, formatEther } from "ethers";

// --- Define the types for our context ---
type WalletContextType = {
  account: string | null;
  signer: Signer | null;
  provider: BrowserProvider | null;
  balance: string | null;
  chainId: number | null;
  status: "connected" | "disconnected" | "connecting" | "error";
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isMetaMaskInstalled: boolean;
};

// --- Create the context with a default value ---
export const WalletContext = createContext<WalletContextType | undefined>(
  undefined
);

// --- Create the Provider Component ---
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [status, setStatus] = useState<WalletContextType["status"]>("disconnected");

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== "undefined" && !!window.ethereum?.isMetaMask;

  // --- Initialize wallet connection state ---
  const initializeWalletState = useCallback(async (browserProvider: BrowserProvider, accounts: string[]) => {
    try {
      if (accounts.length > 0) {
        const currentSigner = await browserProvider.getSigner();
        const network = await browserProvider.getNetwork();

        setProvider(browserProvider);
        setSigner(currentSigner);
        setAccount(accounts[0]);
        setChainId(Number(network.chainId));
        setStatus("connected");
      } else {
        disconnectWallet();
      }
    } catch (error) {
      console.error("Failed to initialize wallet state:", error);
      setStatus("error");
    }
  }, []);

  // --- Core Wallet Connection Logic ---
  const connectWallet = useCallback(async () => {
    if (!(window as any).ethereum) {
      alert("Please install MetaMask!");
      setStatus("error");
      return;
    }

    try {
      setStatus("connecting");
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);

      await initializeWalletState(browserProvider, accounts);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setStatus("error");
    }
  }, [initializeWalletState]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setSigner(null);
    setProvider(null);
    setBalance(null);
    setChainId(null);
    setStatus("disconnected");

    // Clear any stored connection state
    localStorage.removeItem("walletConnected");
  }, []);

  // --- Auto-connect on page load ---
  useEffect(() => {
    const autoConnect = async () => {
      if (!(window as any).ethereum) return;

      try {
        const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await browserProvider.send("eth_accounts", []);

        if (accounts.length > 0) {
          await initializeWalletState(browserProvider, accounts);
          localStorage.setItem("walletConnected", "true");
        }
      } catch (error) {
        console.error("Auto-connect failed:", error);
      }
    };

    // Only auto-connect if user was previously connected
    if (localStorage.getItem("walletConnected") === "true") {
      autoConnect();
    }
  }, [initializeWalletState]);

  // --- Effect to update balance when account or provider changes ---
  useEffect(() => {
    const fetchBalance = async () => {
      if (account && provider) {
        try {
          const balanceBigInt = await provider.getBalance(account);
          setBalance(formatEther(balanceBigInt));
        } catch (error) {
          console.error("Failed to fetch balance:", error);
          setBalance("0");
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
  }, [account, provider]);

  // --- Effect for setting up and cleaning up event listeners ---
  useEffect(() => {
    if (!(window as any).ethereum) return;

    // What to do when the account changes in MetaMask
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected all accounts
        disconnectWallet();
      } else if (accounts[0] !== account) {
        // User switched account - reinitialize everything
        try {
          const browserProvider = new ethers.BrowserProvider((window as any).ethereum!);
          await initializeWalletState(browserProvider, accounts);
        } catch (error) {
          console.error("Failed to handle account change:", error);
          setStatus("error");
        }
      }
    };

    // Handle network/chain changes
    const handleChainChanged = async (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      setChainId(newChainId);

      // Optionally, you can reload the page for simplicity
      // window.location.reload();

      // Or handle it gracefully by reinitializing
      if (provider && account) {
        try {
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));
        } catch (error) {
          console.error("Failed to handle chain change:", error);
        }
      }
    };

    // Add listeners
    (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
    (window as any).ethereum.on("chainChanged", handleChainChanged);

    // IMPORTANT: Cleanup function to remove listeners
    return () => {
      if ((window as any).ethereum) {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [account, provider, initializeWalletState, disconnectWallet]);

  return (
    <WalletContext.Provider
      value={{
        account,
        signer,
        provider,
        balance,
        chainId,
        status,
        connectWallet,
        disconnectWallet,
        isMetaMaskInstalled,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// --- Custom hook for easy access ---
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

// --- Additional utility hook for common wallet operations ---
export const useWalletUtils = () => {
  const context = useWallet();

  return {
    ...context,
    isConnected: context.status === "connected",
    isConnecting: context.status === "connecting",
    shortAddress: context.account
      ? `${context.account.slice(0, 6)}...${context.account.slice(-4)}`
      : null,
    formattedBalance: context.balance
      ? `${parseFloat(context.balance).toFixed(4)} ETH`
      : null,
    networkName: getNetworkName(context.chainId),
  };
};

// Helper function to get network name
function getNetworkName(chainId: number | null): string {
  switch (chainId) {
    case 1: return "Ethereum Mainnet";
    case 11155111: return "Sepolia Testnet";
    case 137: return "Polygon";
    case 31337: return "Hardhat Local";
    default: return chainId ? `Chain ${chainId}` : "Unknown";
  }
}