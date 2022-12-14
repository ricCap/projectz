import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import '@nomiclabs/hardhat-ethers'

import ExampleProjectTemplateABI from '../artifacts/contracts/projects/ExampleProjectTemplate.sol/ExampleProjectTemplate.json'

import { AddressBook } from '../typechain-types/AddressBook'
import { Manager } from '../typechain-types/Manager'
import { ExampleProjectTemplate } from '../typechain-types/projects/ExampleProjectTemplate.sol'
import { ProjectStruct } from '../typechain-types/projects/ExampleProjectTemplate.sol/ExampleProjectTemplate'

describe('Manager', function () {
  this.timeout(50000)

  let managerContract: Manager
  let addressBookContract: AddressBook
  let exampleProjectTemplateContract: ExampleProjectTemplate
  let exampleProjectTemplateContract2: ExampleProjectTemplate
  let owner: SignerWithAddress
  let addr1: SignerWithAddress
  let addr2: SignerWithAddress

  this.beforeEach(async function () {
    // deploy address book
    const addressBookFactory = await ethers.getContractFactory('AddressBook')
    addressBookContract = (await addressBookFactory.deploy()) as AddressBook
    await addressBookContract.deployed()

    // deploy manager
    const managerFactory = await ethers.getContractFactory('Manager')
    managerContract = (await managerFactory.deploy(addressBookContract.address)) as Manager
    await managerContract.deployed()
    ;[owner, addr1, addr2] = await ethers.getSigners()

    // deploy template 1
    const exampleProjectTemplateFactory = await ethers.getContractFactory('ExampleProjectTemplate')
    exampleProjectTemplateContract = (await exampleProjectTemplateFactory.deploy()) as ExampleProjectTemplate
    await exampleProjectTemplateContract.deployed()

    // grant template1 the right access
    await addressBookContract.grantRole(
      await addressBookContract.MANAGER_DONOR_ROLE(),
      exampleProjectTemplateContract.address,
    )

    // deploy template 2
    exampleProjectTemplateContract2 = (await exampleProjectTemplateFactory.deploy()) as ExampleProjectTemplate
    await exampleProjectTemplateContract2.deployed()

    // transfer ownership of template to manager
    await (await exampleProjectTemplateContract.transferOwnership(managerContract.address)).wait()
    await (await exampleProjectTemplateContract2.transferOwnership(managerContract.address)).wait()
  })

  it('should have all manager roles', async () => {
    const roles = [
      await addressBookContract.DEFAULT_ADMIN_ROLE(),
      await addressBookContract.MANAGER_DONOR_ROLE(),
      await addressBookContract.MANAGER_PARTICIPANT_ROLE(),
      await addressBookContract.MANAGER_PARTNER_ROLE(),
    ]
    for (const role of roles) {
      expect(await addressBookContract.hasRole(role, owner.address)).to.equal(true)
    }
  })

  it('should allow DEFAULT_ADMIN to add project template', async () => {
    expect(
      await (await managerContract.connect(owner).addProjectTemplate(exampleProjectTemplateContract.address)).wait(),
    )
      .to.emit(managerContract, 'ProjectTemplateAdded')
      .withArgs(exampleProjectTemplateContract.address, 0)
  })

  it('should not allow to add template with missing MANAGER_PARTNER_ROLE', async () => {
    expect(
      async () =>
        await (await managerContract.connect(owner).addProjectTemplate(exampleProjectTemplateContract2.address)).wait(),
    ).to.revertedWith('project templates should have MANAGER_DONOR_ROLE')
  })

  it('should list templates', async function () {
    await (await managerContract.addProjectTemplate(exampleProjectTemplateContract.address)).wait()
    await addressBookContract.grantRole(
      await addressBookContract.MANAGER_DONOR_ROLE(),
      exampleProjectTemplateContract2.address,
    )
    await (await managerContract.addProjectTemplate(exampleProjectTemplateContract2.address)).wait()
    expect(await managerContract.listProjectTemplates()).to.deep.equal([
      exampleProjectTemplateContract.address,
      exampleProjectTemplateContract2.address,
    ])
    await addressBookContract.revokeRole(
      await addressBookContract.MANAGER_DONOR_ROLE(),
      exampleProjectTemplateContract.address,
    )
  })

  it('can create ExampleProject from template', async function () {
    await (await managerContract.addProjectTemplate(exampleProjectTemplateContract.address)).wait()

    // Check the template was added correctly
    const templates = await managerContract.listProjectTemplates()
    expect(templates.length === 1, 'more templates then the expected 1 were found')
    expect(templates[0]).to.equal(
      exampleProjectTemplateContract.address,
      'deployed template differs from expected exampleProjectTemplate',
    )

    const contractAsExampleProjectTemplate = new ethers.Contract(
      exampleProjectTemplateContract.address,
      ExampleProjectTemplateABI.abi,
    ) as ExampleProjectTemplate

    // Test creating a project
    const project: ProjectStruct = {
      title: 'Project for Gigi',
      description: 'Help Gigi start anew',
    }

    await (
      await contractAsExampleProjectTemplate.connect(owner)['safeMint((string,string))'](project, { gasLimit: 1000000 })
    ).wait()

    const projects = await contractAsExampleProjectTemplate.connect(owner).listProjects()
    expect(
      projects.map(projectStructOutput => {
        return {
          title: projectStructOutput[0],
          description: projectStructOutput[1],
        }
      }),
    ).to.deep.equal([project])
  })
})
