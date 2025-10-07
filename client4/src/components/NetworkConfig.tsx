import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/context/WalletContext";
import { useContracts } from "@/context/ContractContext";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";

const NetworkConfig = () => {
  const { chainId, status: walletStatus } = useWallet();
  const { networkSupported, currentNetwork, error: contractError } = useContracts();
  const [isSwitching, setIsSwitching] = useState(false);

  const switchToSepolia = async () => {
    if (!window.ethereum) return;

    setIsSwitching(true);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia testnet
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Test Network',
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'SepoliaETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
        }
      }
    } finally {
      setIsSwitching(false);
    }
  };

  const switchToHardhat = async () => {
    if (!window.ethereum) return;

    setIsSwitching(true);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }], // Hardhat local
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7a69',
                chainName: 'Hardhat Local',
                rpcUrls: ['http://localhost:8545'],
                nativeCurrency: {
                  name: 'HardhatETH',
                  symbol: 'HH',
                  decimals: 18,
                },
                blockExplorerUrls: [],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add Hardhat network:', addError);
        }
      }
    } finally {
      setIsSwitching(false);
    }
  };

  if (walletStatus !== 'connected') {
    return null;
  }

  if (networkSupported) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Network Connected</p>
              <p className="text-sm text-green-600">
                Connected to {currentNetwork} (Chain ID: {chainId})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          Unsupported Network
        </CardTitle>
        <CardDescription className="text-red-600">
          Please switch to a supported network to use blockchain features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contractError && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{contractError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-red-800">Current Network:</p>
          <p className="text-sm text-red-600">
            Chain ID: {chainId} (Unsupported)
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-red-800">Supported Networks:</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={switchToSepolia}
              disabled={isSwitching}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              {isSwitching ? "Switching..." : "Switch to Sepolia"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={switchToHardhat}
              disabled={isSwitching}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              {isSwitching ? "Switching..." : "Switch to Hardhat"}
            </Button>
          </div>
        </div>

        <div className="text-xs text-red-600">
          <p>• Sepolia Testnet (Chain ID: 11155111) - For testing with real testnet</p>
          <p>• Hardhat Local (Chain ID: 31337) - For local development</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkConfig;
