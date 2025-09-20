const crypto = require('crypto');
const { ethers } = require('ethers');

class Web3AuthService {
    
    // Generate nonce for wallet verification
    static generateNonce() {
        return crypto.randomBytes(32).toString('hex');
    }
    
    // Verify wallet signature
    static verifyWalletSignature(walletAddress, signature, nonce) {
        try {
            const message = `Please sign this message to authenticate: ${nonce}`;
            const recoveredAddress = ethers.utils.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
        } catch (error) {
            console.error('Signature verification failed:', error);
            return false;
        }
    }
    
    // Format wallet address
    static formatWalletAddress(address) {
        return address.toLowerCase();
    }
}

module.exports = Web3AuthService;