import { ethers } from "hardhat";

async function deploy(contractName: string) {
  const factory = await ethers.getContractFactory(contractName);
  const contract = await factory.deploy();
  await contract.deployed();
  console.log(`${contractName} deployed to ${contract.address}`);
}

async function main() {
  deploy("Marketplace")
  deploy("Manager")
}



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
