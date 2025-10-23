[![wakatime](https://wakatime.com/badge/github/Soundcreates/Axon.svg)](https://wakatime.com/badge/github/Soundcreates/Axon)

# 🧠 Axon: Decentralized Peer Review Platform

A blockchain-powered peer review platform that revolutionizes academic manuscript review through decentralized consensus, token incentives, and AI-assisted review processes.

![Axon Logo](https://img.shields.io/badge/Axon-Decentralized%20Peer%20Review-blue?style=for-the-badge&logo=ethereum)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.0-blue?style=for-the-badge&logo=solidity)
![React](https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)

## 🌟 Overview

Axon is a comprehensive peer review platform that combines traditional academic review processes with blockchain technology, creating a transparent, incentivized, and efficient system for manuscript evaluation. The platform features:

- **🔗 Blockchain Integration**: Smart contracts for transparent review processes
- **💰 Token Incentives**: AXON tokens for reviewer rewards and staking
- **🤖 AI-Assisted Reviews**: Intelligent manuscript analysis and reviewer matching
- **📱 Modern UI/UX**: Responsive design with dark/light mode support
- **🔐 Decentralized Identity**: Wallet-based authentication and reputation system

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React/Vite)  │◄──►│   (Node.js)     │◄──►│   (Ethereum)    │
│                 │    │                 │    │                 │
│ • Timeline      │    │ • API Routes    │    │ • PeerReview    │
│ • Review UI     │    │ • Controllers   │    │ • AxonToken     │
│ • Submission    │    │ • Models        │    │ • Staking       │
│ • Dashboard     │    │ • Auth          │    │ • Rewards       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Key Features

### For Authors
- **📄 Manuscript Submission**: Upload and submit manuscripts with IPFS storage
- **👥 Reviewer Assignment**: AI-powered reviewer matching based on expertise
- **📊 Review Tracking**: Real-time progress monitoring and status updates
- **🔗 Blockchain Integration**: Transparent review process on blockchain

### For Reviewers
- **💰 Token Staking**: Stake AXON tokens to participate in reviews
- **📖 Document Review**: Advanced PDF viewer with annotation tools
- **🤖 AI Assistant**: Intelligent review assistance and suggestions
- **🏆 Reputation System**: Build reputation through quality reviews
- **💎 Reward System**: Earn tokens for timely and quality reviews

### For the Platform
- **🔐 Smart Contracts**: Automated review process management
- **⚖️ Dispute Resolution**: Transparent conflict resolution mechanisms
- **📈 Analytics**: Comprehensive review metrics and insights
- **🌐 Decentralized**: No single point of failure or control

## 📁 Project Structure

```
Axon/
├── client4/                    # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Application pages
│   │   ├── context/           # React contexts (Auth, Wallet, Contract)
│   │   ├── service/           # API service layer
│   │   └── contractData/      # Smart contract ABIs
│   ├── public/                # Static assets
│   └── package.json
│
├── server/                     # Node.js Backend
│   ├── controllers/           # API route handlers
│   ├── models/               # Database models (MongoDB)
│   ├── routes/               # Express routes
│   ├── middlewares/          # Authentication & validation
│   ├── services/             # Business logic
│   └── package.json
│
├── hardhat/                   # Smart Contracts
│   ├── contracts/            # Solidity contracts
│   │   ├── PeerReview.sol    # Main review contract
│   │   └── AxonToken.sol     # ERC-20 token contract
│   ├── scripts/              # Deployment scripts
│   └── package.json
│
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for component library
- **Ethers.js** for blockchain interactions
- **React Router** for navigation
- **Sonner** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **IPFS** for decentralized storage
- **CORS** for cross-origin requests

### Blockchain
- **Solidity ^0.8.0** for smart contracts
- **Hardhat** for development and testing
- **OpenZeppelin** for secure contract standards
- **Ethereum** network for deployment

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- MetaMask or compatible wallet
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/axon.git
cd axon
```

### 2. Install Dependencies

#### Frontend
```bash
cd client4
npm install
```

#### Backend
```bash
cd ../server
npm install
```

#### Smart Contracts
```bash
cd ../hardhat
npm install
```

### 3. Environment Setup

#### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/axon
JWT_SECRET=your-jwt-secret-key
PORT=3000
IPFS_GATEWAY=https://ipfs.io/ipfs/
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_PEER_REVIEW_ADDRESS=0x...
VITE_AXON_TOKEN_ADDRESS=0x...
```

### 4. Start Development Servers

#### Terminal 1 - Backend
```bash
cd server
npm start
```

#### Terminal 2 - Frontend
```bash
cd client4
npm run dev
```

#### Terminal 3 - Blockchain (Optional)
```bash
cd hardhat
npx hardhat node
```

### 5. Access the Application
- Frontend: http://localhost:8081
- Backend API: http://localhost:3000/api
- Local Blockchain: http://localhost:8545

## 🔧 Smart Contracts

### PeerReview.sol
The main contract managing the peer review process:

```solidity
// Key Functions
function submitManuscript(string calldata manuscriptHash, string memory title, uint _stakingAmount)
function assignReviewers(bytes32 manuscriptId, address[] calldata reviewers)
function stakeForReview(bytes32 manuscriptId)
function submitReview(bytes32 manuscriptId, string calldata reviewHash)
function finalizePeriod(bytes32 manuscriptId)
```

### AxonToken.sol
ERC-20 token for platform incentives:

```solidity
// Key Functions
function giveWelcomeTokens() // For new users
function approve(address spender, uint256 amount)
function transfer(address to, uint256 amount)
```

## 🎯 Usage Guide

### For Authors

1. **Connect Wallet**: Link your MetaMask wallet
2. **Submit Manuscript**: Upload your paper with metadata
3. **Assign Reviewers**: Select or auto-assign reviewers
4. **Monitor Progress**: Track review status in real-time
5. **Finalize Reviews**: Complete the review process

### For Reviewers

1. **Stake Tokens**: Deposit AXON tokens for review participation
2. **Accept Assignment**: Review assigned manuscripts
3. **Submit Review**: Provide detailed feedback and ratings
4. **Earn Rewards**: Receive tokens for quality reviews

## 🔐 Security Features

- **Smart Contract Audits**: Regular security reviews
- **Access Control**: Role-based permissions
- **Data Encryption**: Secure data transmission
- **Wallet Integration**: Non-custodial token management
- **Reputation System**: Quality-based reviewer ranking

## 📊 API Documentation

### Authentication
```javascript
POST /api/auth/register
POST /api/auth/login
GET /api/user/profile
```

### Manuscripts
```javascript
GET /api/manuscript/getManuscripts
GET /api/manuscript/getManuscript/:id
POST /api/manuscript/submit
POST /api/manuscript/markReviewComplete/:id
POST /api/manuscript/finalizeReview/:id
```

### Users
```javascript
GET /api/user/reviewers
POST /api/user/upload
```

## 🧪 Testing

### Frontend Tests
```bash
cd client4
npm run test
```

### Backend Tests
```bash
cd server
npm test
```

### Smart Contract Tests
```bash
cd hardhat
npx hardhat test
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client4
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
cd server
# Configure environment variables
# Deploy to your preferred platform
```

### Smart Contracts (Ethereum/Testnet)
```bash
cd hardhat
npx hardhat run scripts/deploy.js --network <network>
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin** for secure smart contract standards
- **Ethers.js** for blockchain interactions
- **Shadcn/ui** for beautiful UI components
- **IPFS** for decentralized storage
- **MongoDB** for data persistence

---

<div align="center">

**Built with ❤️ by the Axon Team**

[Website](https://axon.review) • [Twitter](https://twitter.com/axon_review) • [Discord](https://discord.gg/axon)

</div>
