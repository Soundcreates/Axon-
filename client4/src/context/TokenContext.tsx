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
  const { signer } = useWallet();

  useEffect(() => {
    const initializeContract = async () => {
      if (signer) {
        try {
          setTokenContract(prevState => ({
            ...prevState,
            isLoading: true,
          }));

          const tokenInstance = new ethers.Contract(AXON_TOKEN_ADDRESS, TokenContract.abi, signer);

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
            isLoading: false,
            error: "Failed to initialize token contract",
          }));
        }
      } else {
        setTokenContract(prevState => ({
          ...prevState,
          isLoading: false,
        }));
      }
    };

    initializeContract();
  }, [signer]);
  // c
  const tokenBalance = useCallback(
    async (address: string): Promise<bigint> => {
      if (!tokenContract.tokenContract) throw new Error("Token contract not initialized");

      try {
        const balance = await tokenContract.tokenContract.balanceOf(address);
        console.log(`Token balance for ${address}:`, balance.toString());
        return balance;
      } catch (error) {
        console.error("Error fetching token balance:", error);
        throw error;
      }
    }, [tokenContract.tokenContract]
  );

  const sendToken = useCallback(
    async (to: string, amount: bigint) => {
      if (!tokenContract.tokenContract) throw new Error("Token contract not initialized");
      const contractWithSigner = tokenContract.tokenContract.connect(signer);
      await (contractWithSigner as any).transfer(to, amount);
    }, [tokenContract.tokenContract, signer]
  );

  const sendWelcomeTokens = useCallback(
    async (to: string) => {
      if (!tokenContract.tokenContract) throw new Error("Token contract not initialized");
      if (!signer) throw new Error("Signer not available");

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
        throw error;
      }
    }, [tokenContract.tokenContract, signer]
  );



  const contextValue: ITokenContext = {
    ...tokenContract,
    tokenBalance,
    sendToken,
    sendWelcomeTokens,
  };

  return (
    <TokenContext.Provider value={contextValue} >
      {children}
    </TokenContext.Provider >
  );


}


export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
}