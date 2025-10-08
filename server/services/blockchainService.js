import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import contract ABIs
const peerReviewABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../../client4/src/contractData/peerReview.json'), 'utf8'));
const axonTokenABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../../client4/src/contractData/axonToken.json'), 'utf8'));

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

class BlockchainService {
  constructor() {
    this.provider = null;
    this.peerReviewContract = null;
    this.axonTokenContract = null;
    this.currentNetwork = null;
  }

  async initialize() {
    try {
      // Initialize provider - you can use environment variables for RPC URLs
      const rpcUrl = process.env.RPC_URL || 'http://localhost:8545'; // Default to local hardhat
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Get network info
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);
      const networkName = SUPPORTED_NETWORKS[chainId];

      if (!networkName) {
        throw new Error(`Unsupported network. Chain ID: ${chainId}`);
      }

      const contractAddresses = CONTRACT_ADDRESSES[networkName];
      if (!contractAddresses) {
        throw new Error(`Contract addresses not configured for network: ${networkName}`);
      }

      // Initialize contracts (read-only for now)
      this.peerReviewContract = new ethers.Contract(
        contractAddresses.PEER_REVIEW,
        peerReviewABI.abi,
        this.provider
      );

      this.axonTokenContract = new ethers.Contract(
        contractAddresses.AXON_TOKEN,
        axonTokenABI.abi,
        this.provider
      );

      this.currentNetwork = networkName;
      console.log(`Blockchain service initialized on ${networkName} network`);
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  // Helper method to create a wallet from private key
  createWalletFromPrivateKey(privateKey) {
    if (!this.provider) {
      throw new Error('Blockchain service not initialized');
    }
    return new ethers.Wallet(privateKey, this.provider);
  }

  // Helper method to create a wallet from mnemonic
  createWalletFromMnemonic(mnemonic, index = 0) {
    if (!this.provider) {
      throw new Error('Blockchain service not initialized');
    }
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    return wallet.connect(this.provider);
  }

  // Assign reviewers to a manuscript
  async assignReviewers(manuscriptId, reviewerAddresses, authorPrivateKey) {
    try {
      if (!this.peerReviewContract) {
        await this.initialize();
      }

      // Create wallet from author's private key
      const authorWallet = this.createWalletFromPrivateKey(authorPrivateKey);
      
      // Create contract instance with author's wallet as signer
      const peerReviewWithSigner = this.peerReviewContract.connect(authorWallet);

      // Call assignReviewers function
      const tx = await peerReviewWithSigner.assignReviewers(manuscriptId, reviewerAddresses);
      
      console.log(`Assign reviewers transaction submitted: ${tx.hash}`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log(`Assign reviewers transaction confirmed: ${receipt.hash}`);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error assigning reviewers:', error);
      throw new Error(`Failed to assign reviewers: ${error.message}`);
    }
  }

  // Stake for review
  async stakeForReview(manuscriptId, reviewerPrivateKey) {
    try {
      if (!this.peerReviewContract || !this.axonTokenContract) {
        await this.initialize();
      }

      // Create wallet from reviewer's private key
      const reviewerWallet = this.createWalletFromPrivateKey(reviewerPrivateKey);
      
      // Create contract instances with reviewer's wallet as signer
      const peerReviewWithSigner = this.peerReviewContract.connect(reviewerWallet);
      const axonTokenWithSigner = this.axonTokenContract.connect(reviewerWallet);

      // Get stake amount
      const stakeAmount = await this.peerReviewContract.stakeAmount();

      // Approve tokens first
      const approveTx = await axonTokenWithSigner.approve(
        this.peerReviewContract.target,
        stakeAmount
      );
      await approveTx.wait();

      // Then stake for review
      const stakeTx = await peerReviewWithSigner.stakeForReview(manuscriptId);
      const receipt = await stakeTx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        stakeAmount: stakeAmount.toString()
      };
    } catch (error) {
      console.error('Error staking for review:', error);
      throw new Error(`Failed to stake for review: ${error.message}`);
    }
  }

  // Submit review
  async submitReview(manuscriptId, reviewHash, reviewerPrivateKey) {
    try {
      if (!this.peerReviewContract) {
        await this.initialize();
      }

      // Create wallet from reviewer's private key
      const reviewerWallet = this.createWalletFromPrivateKey(reviewerPrivateKey);
      
      // Create contract instance with reviewer's wallet as signer
      const peerReviewWithSigner = this.peerReviewContract.connect(reviewerWallet);

      // Submit review
      const tx = await peerReviewWithSigner.submitReview(manuscriptId, reviewHash);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error submitting review:', error);
      throw new Error(`Failed to submit review: ${error.message}`);
    }
  }

  // Finalize review period
  async finalizePeriod(manuscriptId, authorPrivateKey) {
    try {
      if (!this.peerReviewContract) {
        await this.initialize();
      }

      // Create wallet from author's private key
      const authorWallet = this.createWalletFromPrivateKey(authorPrivateKey);
      
      // Create contract instance with author's wallet as signer
      const peerReviewWithSigner = this.peerReviewContract.connect(authorWallet);

      // Finalize period
      const tx = await peerReviewWithSigner.finalizePeriod(manuscriptId);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error finalizing period:', error);
      throw new Error(`Failed to finalize period: ${error.message}`);
    }
  }

  // Get manuscript details
  async getManuscriptDetails(manuscriptId) {
    try {
      if (!this.peerReviewContract) {
        await this.initialize();
      }

      return await this.peerReviewContract.manuscripts(manuscriptId);
    } catch (error) {
      console.error('Error getting manuscript details:', error);
      throw new Error(`Failed to get manuscript details: ${error.message}`);
    }
  }

  // Get stake amount
  async getStakeAmount() {
    try {
      if (!this.peerReviewContract) {
        await this.initialize();
      }

      return await this.peerReviewContract.stakeAmount();
    } catch (error) {
      console.error('Error getting stake amount:', error);
      throw new Error(`Failed to get stake amount: ${error.message}`);
    }
  }

  // Get reward amount
  async getRewardAmount() {
    try {
      if (!this.peerReviewContract) {
        await this.initialize();
      }

      return await this.peerReviewContract.rewardAmount();
    } catch (error) {
      console.error('Error getting reward amount:', error);
      throw new Error(`Failed to get reward amount: ${error.message}`);
    }
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

// Initialize the service
blockchainService.initialize().catch(console.error);

export default blockchainService;
