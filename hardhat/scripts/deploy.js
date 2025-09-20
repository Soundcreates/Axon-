const {ethers} = require("hardhat");
const {writeFileSync, fstat, writeFile} = require("fs");

async function main() {
  const [deployer ] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Deployer acc balance: ", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  //deploying the axontoken first
  console.log("Deploying AxonToken contract...");
  const axonTokenFactory = await ethers.getContractFactory("AxonToken");
  const axonToken = await axonTokenFactory.deploy(deployer.address);
  await axonToken.waitForDeployment();
  console.log("AxonToken deployed to:", await axonToken.getAddress());

  //writing abi and contract details of axxon token to a json file in client folder
  const axonTokenData = {
    address : await axonToken.getAddress(),
    abi : JSON.parse(axonToken.interface.formatJson()),
  }
  writeFileSync("../client/src/contractData/axonToken.json", JSON.stringify(axonTokenData, null, 2), (err) => {
    if (err) {
      console.error(err);
      return;
    }
  }
  );


  //deploying the peerreview contract now
  const stakeAmount = ethers.parseEther("100");
  const rewardAmount = ethers.parseEther("20");
  console.log("Deploying PeerReview contract...");
  const peerReviewFactory = await ethers.getContractFactory("PeerReview");
  const peerReview = await peerReviewFactory.deploy(axonToken.getAddress(), stakeAmount,deployer.address, rewardAmount);
  await peerReview.waitForDeployment();
  console.log("PeerReview deployed to:", await peerReview.getAddress());

  //writing abi and contract details of peer review to a json file in client folder
  const peerReviewData = {
    address : await peerReview.getAddress(),
    abi: JSON.parse(peerReview.interface.formatJson()),
  }

  writeFileSync("../client/src/contractData/peerReview.json", JSON.stringify(peerReviewData, null, 2), (err) => {
    if (err) {
      console.error(err);
      return;
    }
  }
  );

}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
})