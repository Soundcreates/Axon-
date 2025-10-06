//SPDX-License-Identifier: MIT

//this is our peer revieww contract

pragma solidity ^0.8.0;

import "./AxonToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PeerReview is Ownable {
  //state vars
  AxonToken public immutable axonToken;
  uint public stakeAmount;
  uint public rewardAmount;
  uint public slashedTokenBalance;
  uint public rewardValue;

  enum Status { Pending, Submitted, UnderReview,Reviewed,  Accepted, Rejected }

  struct Manuscript {
    bytes32 id;
    string title;
    string contentHash; //the ipfs hash as we store our doc there and extract its hash
    address author;
    Status currentStatus;
    address[] reviewers;
    uint reviewCount;
    uint256 deadline;
   
  }

  //mappings

   mapping(bytes32 => mapping(address => string)) public reviewHashes; //the revieww hashes of the reviewers

//we have mapped the manuscripts to a unique id, so for this casee i have chosen bytes32 for the unique id
  mapping(bytes32 => Manuscript) public manuscripts;
  mapping(address => int256) public reputationScores;
  

  //events area
  event ManuscriptSubmitted(bytes32 manuscriptId, string manuscriptTitle, address manuscriptAuthor);
  event ReviewerStaked(bytes32 indexed manuscriptId,address indexed reviewer);
  event ReviewersAssigned(bytes32 indexed manuscriptId, address[] reviewers);
  event ReviewSubmitted(bytes32 indexed manuscriptId, address indexed reviewer, string reviewHash);
  event ReviewFinalised(bytes32 indexed manuscriptId, Status finalStatus);
  event ReputationUpdated(address indexed user, int256 newScore);

  //constructor
  constructor (address _tokenAddress, uint _stakeAmount, address _initialOwner , uint _rewardValue) Ownable(_initialOwner) {
    axonToken = AxonToken(_tokenAddress);
    stakeAmount = _stakeAmount;
    rewardValue = _rewardValue;
  }

  //modifier to check that only the author is allowed to do certain actions

  modifier onlyAuthor(bytes32 manuscriptId){
    require(msg.sender == manuscripts[manuscriptId].author, "Only the author can perform this action");
    _;
  }


  function submitManuscript(string calldata manuscriptHash, string memory title, uint _stakingAmount) public  {
    bytes32 manuscriptId = keccak256(abi.encodePacked(manuscriptHash, msg.sender, block.timestamp)); //this is for the id of manuscript
    
    require(manuscripts[manuscriptId].author == address(0), "Manuscript already exists"); //this checks if the manuscript already exists or not
  require(_stakingAmount > 0, "Staking amount should be greater than 0");
  require(axonToken.balanceOf(msg.sender) >= _stakingAmount, "Insufficient token balance to stake");
  require(axonToken.approve(address(this), _stakingAmount), "Token approval failed");
  require(axonToken.transferFrom(payable(msg.sender), address(this), _stakingAmount), "Token transfer failed");

    Manuscript storage newManuscript = manuscripts[manuscriptId];
    newManuscript.id = manuscriptId;
    newManuscript.title = title;
    newManuscript.contentHash = manuscriptHash;
    newManuscript.author = msg.sender;
    newManuscript.currentStatus = Status.Pending;
    newManuscript.reviewCount = 0;


    emit ManuscriptSubmitted(manuscriptId, title, msg.sender);

  }

  function assignReviewers(bytes32 manuscriptId, address[] calldata reviewers) public onlyAuthor(manuscriptId) {
    require(manuscripts[manuscriptId].author != address(0), "Manuscript doesnt exist");
    require(manuscripts[manuscriptId].currentStatus == Status.Pending, "manuscript isnt in pending state to be assigned reviewers");

    manuscripts[manuscriptId].reviewers = reviewers;
    emit ReviewersAssigned(manuscriptId,reviewers);
  }

  function stakeForReview(bytes32 manuscriptId) public {
    
    bool checkFlag = false;

    require(manuscripts[manuscriptId].author != address(0), "Manuscript doesnt exist");
    //check if the msg.sender is one of the reviewers assigned to this manuscript
    for(uint i = 0; i < manuscripts[manuscriptId].reviewers.length; i++){
      if(msg.sender == manuscripts[manuscriptId].reviewers[i]){
        checkFlag = true;
        break;
      }
    }
    require(checkFlag == true, "You are not assigned as a reviewer for this manuscript");

    //staking logic

    require(axonToken.balanceOf(msg.sender) >= stakeAmount, "Insufficient token balance to stake");
    axonToken.transferFrom(msg.sender, address(this), stakeAmount); 
    manuscripts[manuscriptId].currentStatus = Status.UnderReview;

    emit ReviewerStaked(manuscriptId, msg.sender);
  }

  function submitReview(bytes32 manuscriptId, string calldata reviewHash) public {
    require(msg.sender != manuscripts[manuscriptId].author, "Author cannot review their own manuscript");
    require(manuscripts[manuscriptId].currentStatus == Status.UnderReview, "Manuscript is not under review");
    bool isReviewer = false;
    for(uint i = 0 ; i < manuscripts[manuscriptId].reviewers.length; i++){
      if(msg.sender == manuscripts[manuscriptId].reviewers[i]){
        isReviewer = true;
        break;
      }
    }
    require(bytes(reviewHashes[manuscriptId][msg.sender]).length == 0 , "You have already submitted your review for this manuscript");


    require(isReviewer == true, "You are not assigned as a reviewer for this manuscript");
    reviewHashes[manuscriptId][msg.sender] = reviewHash;
    
    manuscripts[manuscriptId].reviewCount += 1;

    emit ReviewSubmitted(manuscriptId, msg.sender, reviewHash);
  }

  function fundRewardPool(uint amount) public {
    axonToken.transferFrom(msg.sender, address(this), amount);
  }

  function finalizePeriod(bytes32 manuscriptId) public onlyAuthor(manuscriptId){
    require(manuscripts[manuscriptId].currentStatus == Status.UnderReview, "Manuscript must be under review to finalize");
    require(block.timestamp >= manuscripts[manuscriptId].deadline, "Review period is not yet over");
    require(axonToken.balanceOf(address(this)) >= rewardAmount * manuscripts[manuscriptId].reviewers.length, "Not enough funds in the contract to return stakes and rewards");

    uint successfullReviews = 0;
    for(uint i=0; i < manuscripts[manuscriptId].reviewers.length ; i++){
      address reviewer = manuscripts[manuscriptId].reviewers[i];
      if(bytes(reviewHashes[manuscriptId][reviewer]).length > 0){ //if the reviewer has reviewed thhen its a good reviewer
        //now we will return the stakeamount to the reviewer
        successfullReviews += 1;
        int rep = reputationScores[reviewer];
        rep += 10; //increase reputation score by 10 for successful review

        if(rep > 250) {
          //if its greater than 250 then we will give them an extra of the amount without the last digit as a rewardBonus
          uint reputationBonus = uint(rep % 10);
          uint totalReward = reputationBonus + rewardAmount;
          axonToken.transfer(address(reviewer), stakeAmount + totalReward);
        }
        else{
          axonToken.transfer(address(reviewer), stakeAmount + rewardAmount);
        }
        
      }else{
        //if the reviewer has not reviewed then we will not return the stake amounts
        reputationScores[reviewer] -= 5; //decrease reputation score by 5 for not submitting review
        //now we will add the slashed stake to the slashed stake amount state var
        slashedTokenBalance += stakeAmount;
      }
      
    }

    if(successfullReviews > 0){
      manuscripts[manuscriptId].currentStatus = Status.Accepted;
    }
    else{
      manuscripts[manuscriptId].currentStatus = Status.Rejected;
    }

    emit ReviewFinalised(manuscriptId, manuscripts[manuscriptId].currentStatus);
  }

  function withdrawSlashedTokens() public onlyOwner{
    require(slashedTokenBalance > 0, "No slashed tokens to withdraw");
    axonToken.transfer(owner(), slashedTokenBalance);
    slashedTokenBalance = 0;
  }

}