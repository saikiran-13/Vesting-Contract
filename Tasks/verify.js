require('@nomiclabs/hardhat-etherscan');

task('verifyContract', 'Verify a contract on Etherscan')
  .addParam('contractaddress', 'The address of the contract to verify')
  .setAction(async (taskArgs) => {
  
    await hre.run('compile');
    await hre.run('verify:verify', {
      address: taskArgs.contractaddress,
      contract:'contracts/vesting.sol:vesting'
    });
  });
module.exports = {}