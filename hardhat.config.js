require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
require('./Tasks/deploy')
require('./Tasks/verify')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",

  networks:{
    
    polygon_mumbai:{
      url:`${process.env.ALCHEMY_API_KEY}`,
      accounts:[`${process.env.WALLET_ADDRESS_PRIVATE_KEY}`]
    },
    
  },
  etherscan:{
    apiKey:`${process.env.POLYGON_MUMBAI_API_KEY}`
  }
};


