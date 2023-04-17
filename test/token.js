const {expect} = require('chai');
const { ethers } = require('hardhat');
const { parseUnits } = ethers.utils;

describe('Token contract',async function (){
    let Token;
    let Tokensupply;

    before(async ()=>{
        Token = await ethers.getContractFactory('CreateToken')
        Token = await Token.deploy(10000)
        Tokensupply = await Token.intialSupply()
    })


        it('Intial Supply should be greater than zero',async ()=>{
            expect(Tokensupply.toNumber()).to.greaterThan(0);
            expect(Tokensupply.toNumber()).to.equal(10000)
        })

        it("Checking the address of the owner",async ()=>{
            const [owner] = await ethers.getSigners()
            expect(owner.address).to.be.a.properAddress
            expect(await Token.tokenowner()).to.equal(owner.address)
        })

        it('Owner should contain the inital supply',async ()=>{
            const [owner] = await ethers.getSigners()  
            const ownerBalance = await Token.balanceOf(owner.address)
            const InitialSupply = parseUnits("10000", 18);
            expect(ownerBalance).to.equal(InitialSupply)
        })

        it('Mint operation can be performed only by the owner',async ()=>{
            const[owner,other] = await ethers.getSigners()
            await Token.connect(owner).mint(other.address,20)
            expect(await Token.balanceOf(other.address)).to.equal(20)
            await expect(Token.connect(other).mint(other.address,10)).to.be.revertedWith("Only Owner can allow this operation");

        })
    })
   

