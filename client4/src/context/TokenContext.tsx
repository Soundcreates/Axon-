import { ethers, Contract } from "ethers";
import TokenContract from "../contractData/axonToken.json";
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useWallet } from "./WalletContext";

const AXON_TOKEN_ADDRESS = TokenContract.address;

interface ITokenState {
  tokenContract: Contract | null;
  isLoading: boolean;
  error: string | null;
}

interface ITokenContext extends ITokenState {
  tokenBalance: (address: string) => Promise<bigint>;
  sendToken: (to: string, amount: bigint) => Promise<void>;
  sendWelcomeTokens: (to: string) => Promise<void>;
}

export const TokenContext = createContext<ITokenContext | undefined>(
  undefined
);

interface TokenProviderProps {
  children: React.ReactNode;
}

export const TokenProvider = ({ children }: TokenProviderProps) => {
  const [tokenContract, setTokenContract] = useState<ITokenState>({
    tokenContract: null,
    isLoading: true,
    error: null,
  });
  const { signer, provider } = useWallet(); // Add provider dependency

  useEffect(() => {
    const initializeContract = async () => {
      try {
        setTokenContract(prevState => ({
          ...prevState,
          isLoading: true,
          error: null,
        }));

        // Use provider if available, fallback to a default provider
        let contractProvider = provider;

        // if (!contractProvider) { not needed , this is causing infinite loop of errors 
        //   console.log("No wallet provider, creating default provider...");
        //   // Create a default provider for read-only operations
        //   contractProvider = new ethers.JsonRpcProvider("http://localhost:8080");
        // }

        const tokenInstance = new ethers.Contract(
          AXON_TOKEN_ADDRESS,
          TokenContract.abi,
          contractProvider
        );

        // Test the contract connection
        try {
          const name = await Promise.race([
            tokenInstance.name(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Contract connection timeout")), 10000)
            )
          ]);
          console.log("Token contract initialized successfully:", name);
        } catch (testError) {
          console.error("Contract test failed:", testError);
          // Don't throw here, just log the error and continue
          console.warn("Contract test failed but continuing with initialization");
        }

        setTokenContract(prevState => ({
          ...prevState,
          tokenContract: tokenInstance,
          isLoading: false,
          error: null,
        }));

      } catch (err) {
        console.error("Error initializing token contract:", err);
        setTokenContract(prevState => ({
          ...prevState,
          tokenContract: null,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to initialize token contract",
        }));
      }
    };

    initializeContract();
  }, [provider, signer]); // Include both provider and signer

  //this is thoda complicated
  const tokenBalance = useCallback(
    async (address: string): Promise<bigint> => {
      // Wait for contract to be ready if it's still loading
      if (tokenContract.isLoading) {
        return new Promise((resolve, reject) => {
          const checkReady = () => {
            if (!tokenContract.isLoading) { //this checks if tokenContract isnot loading and then if tokenContract's tokenContract exists
              if (tokenContract.tokenContract) {
                resolve(tokenContract.tokenContract.balanceOf(address));
              } else {
                reject(new Error("Token contract failed to initialize"));
              }
            } else {
              setTimeout(checkReady, 100);
            }
          };
          setTimeout(checkReady, 100);
        });
      }

      if (!tokenContract.tokenContract) {
        throw new Error("Token contract not initialized");
      }

      if (!ethers.isAddress(address)) {
        throw new Error("Invalid address format");
      }

      try {
        const balance = await tokenContract.tokenContract.balanceOf(address);
        console.log(`Token balance for ${address}:`, balance.toString());
        return balance;
      } catch (error) {
        console.error("Error fetching token balance:", error);
        throw new Error(`Failed to fetch balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    [tokenContract.tokenContract, tokenContract.isLoading]
  );

  const sendToken = useCallback(
    async (to: string, amount: bigint) => {
      if (!tokenContract.tokenContract) {
        throw new Error("Token contract not initialized");
      }
      if (!signer) {
        throw new Error("Wallet not connected - please connect your wallet");
      }
      if (!ethers.isAddress(to)) {
        throw new Error("Invalid recipient address");
      }

      try {
        const contractWithSigner = tokenContract.tokenContract.connect(signer);
        const tx = await (contractWithSigner as any).transfer(to, amount);
        const receipt = await tx.wait();
        console.log("Token transfer successful:", receipt.transactionHash);
        return tx;
      } catch (error) {
        console.error("Error sending tokens:", error);
        throw new Error(`Failed to send tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    [tokenContract.tokenContract, signer]
  );

  const sendWelcomeTokens = useCallback(
    async (to: string) => {
      if (!tokenContract.tokenContract) {
        throw new Error("Token contract not initialized");
      }
      if (!signer) {
        throw new Error("Wallet not connected - please connect your wallet");
      }
      if (!ethers.isAddress(to)) {
        throw new Error("Invalid recipient address");
      }

      try {
        // Check if user already received welcome tokens
        const hasReceived = await (tokenContract.tokenContract as any).hasReceivedWelcomeTokens(to);
        if (hasReceived) {
          throw new Error("Address has already received welcome tokens");
        }

        const contractWithSigner = tokenContract.tokenContract.connect(signer);
        const tx = await (contractWithSigner as any).giveWelcomeTokens(to);
        const receipt = await tx.wait();

        console.log("Welcome tokens sent successfully:", receipt.transactionHash);
        return tx;
      } catch (error) {
        console.error("Error in sendWelcomeTokens:", error);
        if (error instanceof Error && error.message.includes("already received")) {
          throw error; // Re-throw specific errors
        }
        throw new Error(`Failed to send welcome tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    [tokenContract.tokenContract, signer]
  );

  const contextValue: ITokenContext = {
    ...tokenContract,
    tokenBalance,
    sendToken,
    sendWelcomeTokens,
  };

  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};