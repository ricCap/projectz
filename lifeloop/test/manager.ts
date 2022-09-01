import { expect } from "chai"
import { ethers } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import "@nomiclabs/hardhat-ethers"

import { Manager } from "../typechain-types/contracts/Manager"

describe("Manager", function () {
  this.timeout(50000)

  let contract: Manager
  let owner: SignerWithAddress

  this.beforeEach(async function () {
    const managerFactory = await ethers.getContractFactory("Manager")
    contract = await managerFactory.deploy() as Manager
    await contract.deployed()
    owner = (await ethers.getSigners())[0]
  })

  it("Contract creator should have admin role", async function () {
    expect(await contract.getRole()).to.equal("DEFAULT_ADMIN_ROLE")
  });
})
