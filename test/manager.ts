import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import '@nomiclabs/hardhat-ethers'

import { Manager } from '../typechain-types/contracts/Manager'
import { DefaultProject } from '../typechain-types/contracts/DefaultProject'

describe('Manager', function () {
  this.timeout(50000)

  let contract: Manager
  let defaultProjectContract: DefaultProject
  let owner: SignerWithAddress
  let addr1: SignerWithAddress
  let addr2: SignerWithAddress

  this.beforeEach(async function () {
    const managerFactory = await ethers.getContractFactory('Manager')
    contract = (await managerFactory.deploy()) as Manager
    await contract.deployed()
    ;[owner, addr1, addr2] = await ethers.getSigners()

    const defaultProjectFactory = await ethers.getContractFactory('DefaultProject')
    defaultProjectContract = (await defaultProjectFactory.deploy()) as DefaultProject
    await defaultProjectContract.deployed()
    await defaultProjectContract.transferOwnership(contract.address)
  })

  it('should grant contract deployer DEFAULT_ADMIN_ROLE role', async function () {
    expect(ethers.utils.parseBytes32String(await contract.getRole())).to.equal('DEFAULT_ADMIN_ROLE')
  })

  it('should match unkown user with UNKOWN_ROLE', async function () {
    expect(ethers.utils.parseBytes32String(await contract.connect(addr1).getRole())).to.equal('UNKNOWN_ROLE')
  })

  it('should allow DEFAULT_ADMIN to add project template', async () => {
    expect(await (await contract.addProjectTemplate(defaultProjectContract.address)).wait())
      .to.emit(contract, 'ProjectTemplateAdded')
      .withArgs(defaultProjectContract.address, 0)
  })

  it('should allow DEFAULT_ADMIN to mint project from previously-added template', async function () {
    await contract.addProjectTemplate(defaultProjectContract.address)
    expect(await (await contract.createProject(0)).wait())
      .to.emit(contract, 'ProjectMinted')
      .withArgs(0, 0)
    expect(await contract.createProject(0))
      .to.emit(contract, 'ProjectMinted')
      .withArgs(0, 1)
  })

  // add template does not implement erc721 or iprojecttemplate
})
