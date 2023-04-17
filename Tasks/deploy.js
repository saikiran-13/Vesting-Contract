const { task } = require("hardhat/config");

task('deploy','Deploying the contract on public blockchain',async (taskArgs,hre)=>{
    let  vesting = await ethers.getContractFactory('vesting')
    vesting = await vesting.deploy()
    console.log(`Vesting contract deployed at ${vesting.address}`)  
})

module.exports = {}