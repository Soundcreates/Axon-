import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ethers, Contract } from "ethers";
import { useWallet } from "./WalletContext";

// Import ABIs - adjust paths as needed
import PeerReviewABI from "../contractData/peerReview.json";
import AxonTokenABI from "../contractData/axonToken.json";

// Contract addresses for different networks
const CONTRACT_ADDRESSES = {
  sepolia: {
    PEER_REVIEW: "0x3225aD9A3c6e9886DB271aBBcdC62637A593B9fb",
    AXON_TOKEN: "0xB8DB97bD61e9b8b31FaAFe7d0E51aD26eB043F42"
  },
  hardhat: {
    PEER_REVIEW: "0x3225aD9A3c6e9886DB271aBBcdC62637A593B9fb",
    AXON_TOKEN: "0xB8DB97bD61e9b8b31FaAFe7d0E51aD26eB043F42"
  }
};

// Supported networks
const SUPPORTED_NETWORKS = {
  11155111: "sepolia", // Sepolia testnet
  31337: "hardhat"     // Hardhat local
};

// Type for the manuscript
type Manuscript = {
  id: string;
  title: string;
  contentHash: string;
  author: string;
  currentStatus: number;
  reviewers: string[];
  reviewCount: number;
  deadline: number;
};

// Interface for the state managed by the context
interface IContractState {
  peerReviewContract: Contract | null;
  axonTokenContract: Contract | null;
  isLoading: boolean;
  error: string | null;
  networkSupported: boolean;
  currentNetwork: string | null;
}

// Interface for the values and functions exposed by the context
interface IContractContext extends IContractState {
  // PeerReview Contract Functions
  peerReview_submitManuscript: (
    manuscriptHash: string,
    title: string,
    stakingAmount: bigint
  ) => Promise<ethers.ContractTransactionResponse>;
  peerReview_assignReviewers: (
    manuscriptId: string,
    reviewers: string[]
  ) => Promise<void>;
  peerReview_stakeForReview: (manuscriptId: string) => Promise<void>;
  peerReview_submitReview: (
    manuscriptId: string,
    reviewHash: string
  ) => Promise<void>;
  peerReview_finalizePeriod: (manuscriptId: string) => Promise<void>;
  peerReview_fundRewardPool: (amount: bigint) => Promise<void>;
  getManuscriptDetails: (manuscriptId: string) => Promise<any>;

  // AxonToken Contract Functions
  axonToken_balanceOf: (address: string) => Promise<bigint>;
  axonToken_approve: (spender: string, amount: bigint) => Promise<ethers.ContractTransactionResponse>;
  axonToken_allowance: (owner: string, spender: string) => Promise<bigint>;
  axonToken_giveWelcomeTokens: () => Promise<ethers.ContractTransactionResponse>;

  // PeerReview Contract Getter Functions
  getStakeAmount: () => Promise<bigint>;
  getRewardAmount: () => Promise<bigint>;
  // Helper functions
  generateManuscriptId: (contentHash: string, authorAddress: string, timestamp?: number) => string;
  //addresses
  peerReviewAddress: string;
  axonTokenAddress: string;
}

// Create the context
export const ContractContext = createContext<IContractContext | undefined>(
  undefined
);

// Provider Component
interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider = ({ children }: ContractProviderProps) => {
  const { signer } = useWallet();

  const [state, setState] = useState<IContractState>({
    peerReviewContract: null,
    axonTokenContract: null,
    isLoading: false,
    error: null,
    networkSupported: false,
    currentNetwork: null,
  });

  // Initialize contracts when signer is available
  useEffect(() => {
    if (signer) {
      try {
        const initializeContracts = async () => {
          try {
            // Check network first
            const network = await signer.provider?.getNetwork();
            console.log("Current network:", network);

            const chainId = Number(network?.chainId);
            const networkName = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS];

            if (!networkName) {
              throw new Error(`Unsupported network. Please switch to Sepolia testnet (Chain ID: 11155111) or Hardhat local (Chain ID: 31337). Current Chain ID: ${chainId}`);
            }

            const contractAddresses = CONTRACT_ADDRESSES[networkName];
            if (!contractAddresses) {
              throw new Error(`Contract addresses not configured for network: ${networkName}`);
            }

            // Create contracts with proper error handling
            const peerReviewInstance = new ethers.Contract(
              contractAddresses.PEER_REVIEW,
              PeerReviewABI.abi,
              signer
            );
            const axonTokenInstance = new ethers.Contract(
              contractAddresses.AXON_TOKEN,
              AxonTokenABI.abi,
              signer
            );

            setState((prevState) => ({
              ...prevState,
              peerReviewContract: peerReviewInstance,
              axonTokenContract: axonTokenInstance,
              error: null,
              networkSupported: true,
              currentNetwork: networkName,
            }));
          } catch (error) {
            console.error("Error initializing contracts:", error);
            setState((prevState) => ({
              ...prevState,
              error: error instanceof Error ? error.message : "Failed to initialize contracts. Please check your network connection.",
              networkSupported: false,
              currentNetwork: null,
            }));
          }
        };

        initializeContracts();
      } catch (error) {
        console.error("Error in contract initialization:", error);
        setState((prevState) => ({
          ...prevState,
          error: "Failed to initialize contracts",
          networkSupported: false,
          currentNetwork: null,
        }));
      }
    } else {
      setState((prevState) => ({
        ...prevState,
        peerReviewContract: null,
        axonTokenContract: null,
        networkSupported: false,
        currentNetwork: null,
      }));
    }
  }, [signer]);

  // Helper function to generate manuscript ID
  const generateManuscriptId = useCallback((contentHash: string, authorAddress: string, timestamp?: number): string => {
    const time = timestamp || Date.now();
    return ethers.keccak256(ethers.toUtf8Bytes(contentHash + authorAddress + time.toString()));
  }, []);

  // Helper function to handle transactions with better error handling
  const handleTransaction = async (txPromise: Promise<any>) => {
    try {
      setState((s) => ({ ...s, isLoading: true, error: null }));
      const tx = await txPromise;
      const receipt = await tx.wait();
      console.log("Transaction successful:", receipt);
      return receipt;
    } catch (e: any) {
      console.error("Transaction error details:", e);

      // Handle specific ethers.js v6 errors
      let errorMessage = "Transaction failed";

      if (e.code === "UNCONFIGURED_NAME") {
        errorMessage = "Network configuration error. Please check your wallet connection and ensure you're on the correct network.";
      } else if (e.code === "NETWORK_ERROR") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (e.code === "TIMEOUT") {
        errorMessage = "Transaction timeout. Please try again.";
      } else if (e.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Insufficient funds for transaction.";
      } else if (e.code === "USER_REJECTED") {
        errorMessage = "Transaction was rejected by user.";
      } else if (e.reason) {
        errorMessage = e.reason;
      } else if (e.message) {
        errorMessage = e.message;
      }

      console.error("Transaction failed:", errorMessage);
      setState((s) => ({ ...s, error: errorMessage }));
      throw new Error(errorMessage);
    } finally {
      setState((s) => ({ ...s, isLoading: false }));
    }
  };

  // Wrapper Functions for Smart Contract Methods
  const peerReviewAddress = state.peerReviewContract?.target as string || "";

  const peerReview_submitManuscript = useCallback(
    async (manuscriptHash: string, title: string, stakingAmount: bigint): Promise<ethers.ContractTransactionResponse> => {
      if (!state.peerReviewContract) throw new Error("Contract not initialized");

      try {
        setState((s) => ({ ...s, isLoading: true, error: null }));

        const tx = await state.peerReviewContract.submitManuscript(
          manuscriptHash,
          title,
          stakingAmount
        );

        console.log("Transaction submitted:", tx);
        return tx;
      } catch (e: any) {
        console.error("Submit manuscript error:", e);

        let errorMessage = "Failed to submit manuscript";
        if (e.code === "UNCONFIGURED_NAME") {
          errorMessage = "Network configuration error. Please reconnect your wallet and ensure you're on the correct network.";
        } else if (e.reason) {
          errorMessage = e.reason;
        } else if (e.message) {
          errorMessage = e.message;
        }

        setState((s) => ({ ...s, error: errorMessage }));
        throw new Error(errorMessage);
      } finally {
        setState((s) => ({ ...s, isLoading: false }));
      }
    },
    [state.peerReviewContract]
  );

  const peerReview_assignReviewers = useCallback(
    async (manuscriptId: string, reviewerAddresses: string[]) => {
      if (!state.peerReviewContract) throw new Error("Contract not initialized");

      // Validate that all reviewer addresses are valid Ethereum addresses
      const validAddresses = reviewerAddresses.filter(addr => {
        try {
          return ethers.isAddress(addr);
        } catch {
          return false;
        }
      });

      if (validAddresses.length !== reviewerAddresses.length) {
        throw new Error("Some reviewer addresses are invalid");
      }

      await handleTransaction(
        state.peerReviewContract.assignReviewers(manuscriptId, validAddresses)
      );
    },
    [state.peerReviewContract]
  );

  const peerReview_stakeForReview = useCallback(
    async (manuscriptId: string) => {
      if (!state.peerReviewContract || !state.axonTokenContract) {
        throw new Error("Contracts not initialized");
      }

      try {
        // Get stake amount
        const stakeAmount = await state.peerReviewContract.stakeAmount();

        // Approve tokens first
        await handleTransaction(
          state.axonTokenContract.approve(peerReviewAddress, stakeAmount)
        );

        // Then stake
        await handleTransaction(
          state.peerReviewContract.stakeForReview(manuscriptId)
        );
      } catch (error) {
        console.error("Stake for review error:", error);
        throw error;
      }
    },
    [state.peerReviewContract, state.axonTokenContract]
  );

  const peerReview_submitReview = useCallback(
    async (manuscriptId: string, reviewHash: string) => {
      if (!state.peerReviewContract) throw new Error("Contract not initialized");
      await handleTransaction(
        state.peerReviewContract.submitReview(manuscriptId, reviewHash)
      );
    },
    [state.peerReviewContract]
  );

  const peerReview_finalizePeriod = useCallback(
    async (manuscriptId: string) => {
      if (!state.peerReviewContract) throw new Error("Contract not initialized");
      await handleTransaction(
        state.peerReviewContract.finalizePeriod(manuscriptId)
      );
    },
    [state.peerReviewContract]
  );

  const peerReview_fundRewardPool = useCallback(
    async (amount: bigint) => {
      if (!state.peerReviewContract || !state.axonTokenContract) {
        throw new Error("Contracts not initialized");
      }

      // Approve first, then fund
      await handleTransaction(
        state.axonTokenContract.approve(peerReviewAddress, amount)
      );
      await handleTransaction(
        state.peerReviewContract.fundRewardPool(amount)
      );
    },
    [state.peerReviewContract, state.axonTokenContract]
  );

  const getManuscriptDetails = useCallback(
    async (manuscriptId: string) => {
      if (!state.peerReviewContract) throw new Error("Contract not initialized");
      return await state.peerReviewContract.manuscripts(manuscriptId);
    },
    [state.peerReviewContract]
  );

  const axonToken_balanceOf = useCallback(
    async (address: string) => {
      if (!state.axonTokenContract) throw new Error("Token contract not initialized");
      return await state.axonTokenContract.balanceOf(address);
    },
    [state.axonTokenContract]
  );

  const axonToken_approve = useCallback(
    async (spender: string, amount: bigint): Promise<ethers.ContractTransactionResponse> => {
      if (!state.axonTokenContract) throw new Error("Token contract not initialized");

      try {
        setState((s) => ({ ...s, isLoading: true, error: null }));
        const tx = await state.axonTokenContract.approve(spender, amount);
        console.log("Approve transaction submitted:", tx);
        return tx;
      } catch (e: any) {
        console.error("Approve transaction error:", e);

        let errorMessage = "Approve transaction failed";
        if (e.code === "UNCONFIGURED_NAME") {
          errorMessage = "Network configuration error. Please reconnect your wallet.";
        } else if (e.reason) {
          errorMessage = e.reason;
        } else if (e.message) {
          errorMessage = e.message;
        }

        setState((s) => ({ ...s, error: errorMessage }));
        throw new Error(errorMessage);
      } finally {
        setState((s) => ({ ...s, isLoading: false }));
      }
    },
    [state.axonTokenContract]
  );

  const axonToken_allowance = useCallback(
    async (owner: string, spender: string): Promise<bigint> => {
      if (!state.axonTokenContract) throw new Error("Token contract not initialized");
      return await state.axonTokenContract.allowance(owner, spender);
    },
    [state.axonTokenContract]
  );

  const axonToken_giveWelcomeTokens = useCallback(
    async (): Promise<ethers.ContractTransactionResponse> => {
      if (!state.axonTokenContract || !signer) throw new Error("Token contract not initialized");

      try {
        setState((s) => ({ ...s, isLoading: true, error: null }));
        // The contract function expects an address parameter (the recipient)
        const signerAddress = await signer.getAddress();
        const tx = await state.axonTokenContract.giveWelcomeTokens(signerAddress);
        console.log("Welcome tokens transaction submitted:", tx);
        return tx;
      } catch (e: any) {
        console.error("Give welcome tokens error:", e);

        let errorMessage = "Give welcome tokens failed";
        if (e.code === "UNCONFIGURED_NAME") {
          errorMessage = "Network configuration error. Please reconnect your wallet.";
        } else if (e.reason) {
          errorMessage = e.reason;
        } else if (e.message) {
          errorMessage = e.message;
        }

        setState((s) => ({ ...s, error: errorMessage }));
        throw new Error(errorMessage);
      } finally {
        setState((s) => ({ ...s, isLoading: false }));
      }
    },
    [state.axonTokenContract, signer]
  );

  const getStakeAmount = useCallback(
    async (): Promise<bigint> => {
      if (!state.peerReviewContract) throw new Error("Contract not initialized");
      return await state.peerReviewContract.stakeAmount();
    },
    [state.peerReviewContract]
  );

  const getRewardAmount = useCallback(
    async (): Promise<bigint> => {
      if (!state.peerReviewContract) throw new Error("Contract not initialized");
      return await state.peerReviewContract.rewardAmount();
    },
    [state.peerReviewContract]
  );

  const axonTokenAddress = state.axonTokenContract?.target as string || "";

  // Context value
  const contextValue: IContractContext = {
    ...state,
    peerReview_submitManuscript,
    peerReview_assignReviewers,
    peerReview_stakeForReview,
    peerReview_submitReview,
    peerReview_finalizePeriod,
    peerReview_fundRewardPool,
    getManuscriptDetails,
    axonToken_balanceOf,
    axonToken_approve,
    axonToken_allowance,
    axonToken_giveWelcomeTokens,
    getStakeAmount,
    getRewardAmount,
    generateManuscriptId,
    peerReviewAddress,
    axonTokenAddress,
  };

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
};

// Custom Hook
export const useContracts = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error("useContracts must be used within a ContractProvider");
  }
  return context;
};
