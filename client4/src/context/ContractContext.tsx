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

const PEER_REVIEW_ADDRESS = "0x3225aD9A3c6e9886DB271aBBcdC62637A593B9fb";
const AXON_TOKEN_ADDRESS = "0xB8DB97bD61e9b8b31FaAFe7d0E51aD26eB043F42";

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
  const { signer } = useWallet(); // Use the custom hook instead of useContext

  const [state, setState] = useState<IContractState>({
    peerReviewContract: null,
    axonTokenContract: null,
    isLoading: false,
    error: null,
  });

  // Initialize contracts when signer is available
  useEffect(() => {
    if (signer) {
      try {
        const peerReviewInstance = new ethers.Contract(
          PEER_REVIEW_ADDRESS,
          PeerReviewABI.abi, // Use the abi property
          signer
        );
        const axonTokenInstance = new ethers.Contract(
          AXON_TOKEN_ADDRESS,
          AxonTokenABI.abi, // Use the abi property
          signer
        );

        setState((prevState) => ({
          ...prevState,
          peerReviewContract: peerReviewInstance,
          axonTokenContract: axonTokenInstance,
          error: null,
        }));
      } catch (error) {
        console.error("Error initializing contracts:", error);
        setState((prevState) => ({
          ...prevState,
          error: "Failed to initialize contracts",
        }));
      }
    } else {
      setState((prevState) => ({
        ...prevState,
        peerReviewContract: null,
        axonTokenContract: null,
      }));
    }
  }, [signer]);

  // Helper function to handle transactions
  const handleTransaction = async (txPromise: Promise<any>) => {
    try {
      setState((s) => ({ ...s, isLoading: true, error: null }));
      const tx = await txPromise;
      const receipt = await tx.wait();
      console.log("Transaction successful:", receipt);
      return receipt;
    } catch (e: any) {
      const errorMessage = e.reason || e.message || "Transaction failed";
      console.error("Transaction failed:", errorMessage);
      setState((s) => ({ ...s, error: errorMessage }));
      throw new Error(errorMessage);
    } finally {
      setState((s) => ({ ...s, isLoading: false }));
    }
  };

  // Wrapper Functions for Smart Contract Methods
  const peerReviewAddress = PEER_REVIEW_ADDRESS; // Exported for use in other components

  const peerReview_submitManuscript = useCallback(
    async (manuscriptHash: string, title: string, stakingAmount: bigint): Promise<ethers.ContractTransactionResponse> => {
      if (!state.peerReviewContract) throw new Error("Contract not initialized");

      try {

        setState((s) => ({ ...s, isLoading: true, error: null }));
        const tx = await state.peerReviewContract.submitManuscript(manuscriptHash, title, stakingAmount);
        console.log("Transaction submitted:", tx);
        return tx;
      } catch (e: any) {
        const errorMessage = e.reason || e.message || "Transaction failed";
        console.error("Transaction failed:", errorMessage);
        setState((s) => ({ ...s, error: errorMessage }));
        throw new Error(errorMessage);
      } finally {
        setState((s) => ({ ...s, isLoading: false }));
      }
    },
    [state.peerReviewContract]
  );

  const peerReview_assignReviewers = useCallback(
    async (manuscriptId: string, reviewers: string[]) => {
      if (!state.peerReviewContract) throw new Error("Contract not initialized");
      await handleTransaction(
        state.peerReviewContract.assignReviewers(manuscriptId, reviewers)
      );
    },
    [state.peerReviewContract]
  );

  const peerReview_stakeForReview = useCallback(
    async (manuscriptId: string) => {
      if (!state.peerReviewContract || !state.axonTokenContract) {
        throw new Error("Contracts not initialized");
      }

      // Get stake amount
      const stakeAmount = await state.peerReviewContract.stakeAmount();

      // Approve tokens first
      await handleTransaction(
        state.axonTokenContract.approve(PEER_REVIEW_ADDRESS, stakeAmount)
      );

      // Then stake
      await handleTransaction(
        state.peerReviewContract.stakeForReview(manuscriptId)
      );
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
        state.axonTokenContract.approve(PEER_REVIEW_ADDRESS, amount)
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
        const errorMessage = e.reason || e.message || "Approve transaction failed";
        console.error("Approve transaction failed:", errorMessage);
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
      if (!state.axonTokenContract) throw new Error("Token contract not initialized");

      try {
        setState((s) => ({ ...s, isLoading: true, error: null }));
        const tx = await state.axonTokenContract.giveWelcomeTokens();
        console.log("Welcome tokens transaction submitted:", tx);
        return tx;
      } catch (e: any) {
        const errorMessage = e.reason || e.message || "Give welcome tokens failed";
        console.error("Give welcome tokens failed:", errorMessage);
        setState((s) => ({ ...s, error: errorMessage }));
        throw new Error(errorMessage);
      } finally {
        setState((s) => ({ ...s, isLoading: false }));
      }
    },
    [state.axonTokenContract]
  );

  const axonTokenAddress = AXON_TOKEN_ADDRESS; // Exported for use in other components

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

    //addresses
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