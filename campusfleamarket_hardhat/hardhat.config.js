require("@nomicfoundation/hardhat-toolbox");
require("./test/block-number");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  defaultNetwork:"gethlocal",
  networks:{
    gethlocal:{
      url:"http://127.0.0.1:8888/",
      chainId:1337,
    }
  }
};
