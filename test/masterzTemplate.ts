import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import { BigNumber } from '@ethersproject/bignumber'
import * as Kit from '@celo/contractkit'
import hre from 'hardhat'

import { AddressBook } from '../typechain-types/AddressBook'
import { Manager } from '../typechain-types/Manager'
import { MasterZTemplate } from '../typechain-types/projects/MasterZTemplate'
import { ProjectLibrary } from '../typechain-types/projects/ProjectsLibrary.sol/ProjectLibrary'

/** Conditional tests */
const itIf = (condition: boolean) => (condition ? it : it.skip)
const integrationTestsOn = hre.network.name == 'alfajores' || hre.network.name == 'ganache'

describe('MasterZTemplate', function () {
  let managerContract: Manager
  let owner: SignerWithAddress
  let donor: SignerWithAddress
  let masterzTemplateContract: MasterZTemplate

  beforeEach(async function () {
    ;[owner, donor] = await ethers.getSigners()

    // deploy address book
    const addressBookFactory = await ethers.getContractFactory('AddressBook')
    const addressBook = (await addressBookFactory.deploy()) as AddressBook
    await addressBook.deployed()

    // deploy manager
    const managerFactory = await ethers.getContractFactory('Manager')
    managerContract = (await managerFactory.deploy(addressBook.address)) as Manager
    await managerContract.deployed()

    // deploy library
    const projectLibraryFactory = await ethers.getContractFactory('ProjectLibrary')
    const projectLibraryContract = (await projectLibraryFactory.deploy()) as ProjectLibrary
    await projectLibraryContract.deployed()

    // deploy MasterZTemplate
    const masterzTemplateFactory = await ethers.getContractFactory('MasterZTemplate', {
      libraries: {
        ProjectLibrary: projectLibraryContract.address,
      },
    })
    masterzTemplateContract = (await masterzTemplateFactory.deploy()) as MasterZTemplate

    // transfer ownership of template to manager
    await (await masterzTemplateContract.transferOwnership(managerContract.address)).wait()
  })

  const partecipantAddress = '0x0000000000000000000000000000000000000000'
  async function deployProject() {
    const deadlineDays = BigNumber.from(1) // days
    await (
      await masterzTemplateContract
        .connect(owner)
        ['safeMint(address,uint256)'](partecipantAddress, deadlineDays, { gasLimit: 1000000 })
    ).wait()
  }

  it('Should create project', async function () {
    await deployProject()

    const projects = await masterzTemplateContract.connect(owner).listProjects()

    expect(projects.length).to.equal(1)
    expect(projects[0][0]).to.equal(0)
    expect(projects[0][1]).to.equal('Title')
    expect(projects[0][2]).to.equal('Description')
    expect(projects[0][3]).to.equal(partecipantAddress)
    // TODO expect(projects[0][4]).to.equal(deadlineDays)
    expect(projects[0][5].length).equal(1)
    expect([...projects[0][5][0]]).deep.equal([
      0,
      'Checkpoint title',
      'Follow 80% of courses.',
      BigNumber.from(1),
      BigNumber.from(0),
    ])
    expect(projects[0][0]).to.equal(BigNumber.from(0))
  })

  async function approveDonationToContract(): Promise<void> {
    const kit = Kit.newKit('http://localhost:8545')
    const cUSDtoken = await kit.contracts.getStableToken()
    await cUSDtoken
      .approve(masterzTemplateContract.address, '10000000000000000000000')
      .sendAndWaitForReceipt({ from: owner.address, gasPrice: 391536019 })
  }

  itIf(integrationTestsOn)('Should fund project', async function () {
    await deployProject()
    await approveDonationToContract()
    await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('1'))).wait()
  })

  itIf(integrationTestsOn)('Should not reach hardcap with donation smaller than hardcap', async function () {
    await deployProject()
    await approveDonationToContract()
    await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('1'))).wait()
    expect(await masterzTemplateContract.getProjectStatus(0)).equals(0)
  })

  itIf(integrationTestsOn)('Should reach hardcap with donation greater than hardcap', async function () {
    await deployProject()
    await approveDonationToContract()
    await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('10'))).wait()
    expect(await masterzTemplateContract.getProjectStatus(0)).equals(1)
  })

  itIf(integrationTestsOn)('Should start project', async function () {
    await deployProject()
    await approveDonationToContract()
    await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('10'))).wait()
    await (await masterzTemplateContract.connect(owner).startProject(0)).wait()
    expect(await masterzTemplateContract.getProjectStatus(0)).equals(2)
  })

  itIf(integrationTestsOn)('First checkpoint should be activated', async function () {
    await deployProject()
    await approveDonationToContract()
    await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('10'))).wait()
    await (await masterzTemplateContract.connect(owner).startProject(0)).wait()
    const projects = await masterzTemplateContract.connect(owner).listProjects()
    expect(projects[0][6]).equals(0)
  })
})
