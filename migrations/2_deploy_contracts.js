const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function(deployer) {
  // Deploy Token.sol
  await deployer.deploy(Token);
  const token = await Token.deployed();

  // Deploy EthSwap.sol
  await deployer.deploy(EthSwap, token.address);
  const ethSwap = await EthSwap.deployed();
  
  // Transfer ALL tokens from deployer to EthSwap smart contract
  await token.transfer(ethSwap.address, '1000000000000000000000000')
};
