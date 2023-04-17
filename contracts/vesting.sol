// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract vesting{

    IERC20 public token;
    struct beneficiarydata{
        address addressOfToken;
        uint noOfTokens;
        uint cliff;
        uint startTime;
        uint duration;
        uint slicePeriod;
        bool locked;
    }

    mapping (address => beneficiarydata[]) public beneficiaryDetails;
    mapping (address => mapping(uint => uint)) public releasedTokens;//keeps track of amount of tokens by beneficiary at particular period
    mapping (address => mapping(address => bool)) public whitelist;

    event tokensLocked(address beneficiary,address Tokenaddress,uint tokens);
    event tokensWithdrawn(address beneficiary,address Tokenaddress,uint tokens);


    function whitelistTokens(address _tokenaddress) external {
        whitelist[msg.sender][_tokenaddress] = true;
    }

    function checkBalance() external view returns(uint){
        return token.balanceOf(address(this));
    }

    function lockTokens(address _tokenaddress,uint _noOfTokens,uint _cliff,uint _duration,uint _sliceperiod) external{
        require(whitelist[msg.sender][_tokenaddress],"Token not allowed");
        require(_noOfTokens>0,"Invalid amount of tokens");
        require(_cliff<_duration,"Cliff cannot be above Duration");
        token = IERC20(_tokenaddress);

        beneficiarydata memory person = beneficiarydata({
            addressOfToken:_tokenaddress,
            noOfTokens:_noOfTokens,
            cliff:_cliff,
            startTime: block.timestamp + _cliff,
            duration:_duration,
            slicePeriod:_sliceperiod,
            locked:true
        });

        beneficiaryDetails[msg.sender].push(person);
        token.transferFrom(msg.sender,address(this),_noOfTokens);
        emit tokensLocked(msg.sender,_tokenaddress,_noOfTokens);
    }
   
    function withdrawTokens(uint8 index) external {
        require(block.timestamp>beneficiaryDetails[msg.sender][index].startTime,"No tokens unlocked");
        require(releasedTokens[msg.sender][index]<beneficiaryDetails[msg.sender][index].noOfTokens,"Tokens already withdrawn");
        token = IERC20(beneficiaryDetails[msg.sender][index].addressOfToken);
        uint tokensLeft=unlockTokens(index);
        require(tokensLeft!=0);
        releasedTokens[msg.sender][index]+=tokensLeft;
        token.transfer(msg.sender,tokensLeft);
        address Tokenaddress = beneficiaryDetails[msg.sender][index].addressOfToken;
        emit tokensWithdrawn(msg.sender,Tokenaddress,releasedTokens[msg.sender][index]);
    }
    
    function unlockTokens(uint8 ind) public view returns(uint) {

        uint totalNoOfPeriods = beneficiaryDetails[msg.sender][ind].duration/beneficiaryDetails[msg.sender][ind].slicePeriod;
        uint tokensPerPeriod = (beneficiaryDetails[msg.sender][ind].noOfTokens)/(totalNoOfPeriods);
        uint timePeriodSinceStart = block.timestamp - beneficiaryDetails[msg.sender][ind].startTime;
        uint noOfPeriodsTillNow = timePeriodSinceStart/(beneficiaryDetails[msg.sender][ind].slicePeriod);
        uint noOfTokensTillNow = (noOfPeriodsTillNow * tokensPerPeriod) - releasedTokens[msg.sender][ind] ;

        if(noOfPeriodsTillNow >= totalNoOfPeriods){ //Exceeded the duration
            return (beneficiaryDetails[msg.sender][ind].noOfTokens) - releasedTokens[msg.sender][ind];
        }

        return noOfTokensTillNow ;
    }
     
    function getTime() external view returns(uint){
        return block.timestamp;
    }
    

 }