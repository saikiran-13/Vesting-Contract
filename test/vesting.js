const {expect} = require('chai');
const { ethers } = require('hardhat');

async function deploy(){
    const [contractName,...Arguments] = arguments
    let temp = await ethers.getContractFactory(contractName)
    temp = await temp.deploy(...Arguments);
    return temp
}


describe("Contracts Deployment",function (){

    let token
    let vesting
    let noOfTokens
    let cliff
    let duration
    let sliceperiod
    let approval
    let beneficiary1,beneficiary2,beneficiary3

    before(async()=>{
        token = await deploy('CreateToken',10000)
        vesting = await deploy('vesting')
        const [Beneficiary1,Beneficiary2,Beneficiary3] = await ethers.getSigners()  
        beneficiary1 = Beneficiary1,beneficiary2 = Beneficiary2,beneficiary3 = Beneficiary3
        approval = await token.approve(vesting.address,300)
        await vesting.whitelistTokens(token.address) 
        noOfTokens = 10
        cliff = 0
        duration = 10
        sliceperiod = 1
    })


    it("Whitelisting tokens by the beneficiary",async ()=>{
        await vesting.connect(beneficiary2).whitelistTokens(token.address)
        expect(token.address).to.be.a.properAddress  
        expect(await vesting.whitelist(beneficiary1.address,token.address)).to.equal(true)
        expect(await vesting.whitelist(beneficiary2.address,token.address)).to.equal(true)
        expect(await vesting.whitelist(beneficiary3.address,token.address)).to.equal(false)
    })



    it("Checking Approval and sufficient allowance",async ()=>{       
        expect(approval.confirmations).to.equal(1)
        const allowanceAmount = await token.allowance(beneficiary1.address, vesting.address);
        expect(noOfTokens).to.lessThanOrEqual(allowanceAmount)
    })

    it("Before locking Tokens,whitelist needs to be done",async ()=>{
        expect(await vesting.whitelist(beneficiary1.address,token.address)).to.be.equal(true)
        expect(await vesting.whitelist(beneficiary3.address,token.address)).to.be.revertedWith("Token not allowed")
    })

    it("No of tokens to be locked must be greater than zero",async ()=>{
        expect(noOfTokens).to.be.above(0,"No of tokens should be above zero")
        noOfTokens = 0
        await expect(vesting.lockTokens(token.address,noOfTokens,cliff,duration,sliceperiod)).to.be.revertedWith("Invalid amount of tokens")
    })

    it("Token lock duration should be greater than current time",async ()=>{
        noOfTokens = 10
        //duration = 0
        const lockDuration = await vesting.getTime() + duration;
        expect(lockDuration).to.be.above(await vesting.getTime(),"Lock time should be above current time")
        await vesting.lockTokens(token.address,noOfTokens,cliff,duration,sliceperiod)
    })
      
    it("Cliff should be not be greater than duration",async ()=>{
        noOfTokens = 20
        cliff = 130
        duration = 120
        sliceperiod = 10
        await expect(vesting.lockTokens(token.address,noOfTokens,cliff,duration,sliceperiod)).to.be.revertedWith("Cliff cannot be above Duration")
        cliff = 10
        await vesting.lockTokens(token.address,noOfTokens,cliff,duration,sliceperiod)
        expect(cliff).to.lessThanOrEqual(duration)
        expect(sliceperiod).to.lessThanOrEqual(duration)
       
    })

    it("Emit the tokensLocked Event",async ()=>{
        noOfTokens = 30
        cliff = 0
        await token.mint(beneficiary2.address,30)
        approval = await token.connect(beneficiary2).approve(vesting.address,30)
        await vesting.connect(beneficiary2).whitelistTokens(token.address)
        expect(await vesting.connect(beneficiary2).lockTokens(token.address,noOfTokens,cliff,duration,sliceperiod))
        .to.emit(vesting,'tokensLocked')
        .withArgs(beneficiary2.address,token.address,noOfTokens)

    })

  
    it("Lock should be done before withdrawing Tokens",async ()=>{
        const lock= await vesting.beneficiaryDetails(beneficiary1.address,0)
        expect(lock.locked).to.be.true
    })
    
    it("Verifying the Lock amount at particular period",async ()=>{
        // noOfTokens = 10
        // cliff = 0
        // duration = 10
        // sliceperiod = 1
        expect(await vesting.unlockTokens(0)).to.be.equal(6)

    })

    it('Current Time should be greater than interval unlock Time',async ()=>{
        // noOfTokens = 20
        // cliff = 10
        // duration = 120
        // sliceperiod = 10
        let unlockTime = Number(await vesting.getTime())+ cliff+duration/sliceperiod
        await network.provider.send("evm_increaseTime", [18])
        await network.provider.send("evm_mine")
        const currentTime = await vesting.getTime()
        await vesting.withdrawTokens(1)
        expect(Number(currentTime)).to.be.greaterThan(Number(unlockTime))
        
    })
    
    it("All tokens released after duration",async ()=>{
        // Withdrawing the tokens of beneficiary2
        // noOfTokens = 30
        // cliff = 0
        // duration = 120
        // sliceperiod = 10
        await network.provider.send("evm_increaseTime", [100])
        await network.provider.send("evm_mine")
        await vesting.connect(beneficiary2).withdrawTokens(0)
        const tokensReleased = await vesting.releasedTokens(beneficiary2.address,0)
        expect(noOfTokens).to.be.equal(tokensReleased.toNumber())
    })
 

        it("Emit the tokensWithdrawn Event",async ()=>{
            expect(await vesting.withdrawTokens(0))
            .to.emit(vesting,'tokensWithdrawn')
            .withArgs(beneficiary1.address,token.address,await vesting.releasedTokens(beneficiary1.address,0))      
        })
    })
  
