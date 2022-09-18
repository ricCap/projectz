import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import '@nomiclabs/hardhat-ethers'

import { Manager } from '../typechain-types/contracts/Manager'
import { ExampleProjectTemplate } from '../typechain-types/contracts/projects/ExampleProjectTemplate'

describe('Manager', function () {
  this.timeout(50000)

  let managerContract: Manager
  let exampleProjectTemplateContract: ExampleProjectTemplate
  let owner: SignerWithAddress
  let addr1: SignerWithAddress
  let addr2: SignerWithAddress

  this.beforeEach(async function () {
    // deploy manager
    const managerFactory = await ethers.getContractFactory('Manager')
    managerContract = (await managerFactory.deploy()) as Manager
    await managerContract.deployed()
    ;[owner, addr1, addr2] = await ethers.getSigners()

    // deploy template
    const exampleProjectTemplateFactory = await ethers.getContractFactory('ExampleProjectTemplate')
    exampleProjectTemplateContract = (await exampleProjectTemplateFactory.deploy()) as ExampleProjectTemplate
    await exampleProjectTemplateContract.deployed()

    // transfer ownership of template to manager
    await exampleProjectTemplateContract.transferOwnership(managerContract.address)
  })

  it('should grant contract deployer DEFAULT_ADMIN_ROLE role', async function () {
    expect(ethers.utils.parseBytes32String(await managerContract.getRole())).to.equal('DEFAULT_ADMIN_ROLE')
  })

  it('should match unkown user with UNKNOWN_ROLE', async function () {
    expect(ethers.utils.parseBytes32String(await managerContract.connect(addr1).getRole())).to.equal('UNKNOWN_ROLE')
  })

  it('should allow DEFAULT_ADMIN to add project template', async () => {
    expect(await (await managerContract.addProjectTemplate(exampleProjectTemplateContract.address)).wait())
      .to.emit(managerContract, 'ProjectTemplateAdded')
      .withArgs(exampleProjectTemplateContract.address, 0)
  })

  it('should allow DEFAULT_ADMIN to mint project from previously-added template', async function () {
    await managerContract.addProjectTemplate(exampleProjectTemplateContract.address)
    expect(await (await managerContract.createProject(0)).wait())
      .to.emit(managerContract, 'ProjectMinted')
      .withArgs(0, 0)
    expect(await managerContract.createProject(0))
      .to.emit(managerContract, 'ProjectMinted')
      .withArgs(0, 1)
  })

  it('should list templates', async function () {
    await managerContract.addProjectTemplate(exampleProjectTemplateContract.address)
    await managerContract.addProjectTemplate(exampleProjectTemplateContract.address)
    expect(await managerContract.listProjectTemplates()).to.deep.equal([
      exampleProjectTemplateContract.address,
      exampleProjectTemplateContract.address,
    ])
  })

  // add template does not implement erc721 or iprojecttemplate
})
