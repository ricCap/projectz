import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import "@nomiclabs/hardhat-ethers";

import { Manager } from "../typechain-types/contracts/Manager";
import { DefaultProject } from "../typechain-types/contracts/DefaultProject";

describe("Manager", function () {
  this.timeout(50000);

  let contract: Manager;
  let defaultProjectContract: DefaultProject;
  let owner: SignerWithAddress;

  this.beforeEach(async function () {
    const managerFactory = await ethers.getContractFactory("Manager");
    contract = (await managerFactory.deploy()) as Manager;
    await contract.deployed();
    owner = (await ethers.getSigners())[0];

    const defaultProjectFactory = await ethers.getContractFactory(
      "DefaultProject"
    );
    defaultProjectContract =
      (await defaultProjectFactory.deploy()) as DefaultProject;
    await defaultProjectContract.deployed();
    await defaultProjectContract.transferOwnership(contract.address);
  });

  it("Contract creator should have admin role", async function () {
    expect(ethers.utils.parseBytes32String(await contract.getRole())).to.equal(
      "DEFAULT_ADMIN_ROLE"
    );
  });

  it("Manager contract adds project template and mints nft", async function () {
    await contract.addProjectTemplate(defaultProjectContract.address);
    expect(await (await contract.createProject(0)).wait())
      .to.emit(contract, "ProjectMinted")
      .withArgs(0, 0);
    expect(await contract.createProject(0))
      .to.emit(contract, "ProjectMinted")
      .withArgs(0, 1);
  });
});
