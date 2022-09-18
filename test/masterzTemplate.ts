import { expect } from "chai";
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

describe("MasterZTemplate", function () {
  // Fixture
  async function deployContractFixture() {
    const deadlineDays = "1"; // days
    const partecipantAddress = "0x0123456789";

    const [owner, otherAccounts] = await ethers.getSigners();

    const MasterZTemplate = await ethers.getContractFactory("MasterZTemplate");
    const deployed = await MasterZTemplate.deploy(partecipantAddress, deadlineDays);

    return { deployed, MasterZTemplate, owner, otherAccounts, deadlineDays };
  }

  it("Should Get initial contract state == 0", async function () {
    const { deployed } = await loadFixture(deployContractFixture());

    const projectState = await deployed.getProjectStatus();
    expect(projectState).to.equal(0);
  });
});
