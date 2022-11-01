import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import { BigNumber } from '@ethersproject/bignumber'
import * as Kit from '@celo/contractkit'
import hre from 'hardhat'

import { AddressBook } from '../typechain-types/AddressBook'
import { Manager } from '../typechain-types/Manager'
import { MasterZTemplate } from '../typechain-types/projects/MasterZTemplate'
import { AddressBookLibrary } from '../typechain-types/addressBook/AddressBookLibrary'
import { ProjectLibrary } from '../typechain-types/projects/ProjectsLibrary.sol/ProjectLibrary'
import { privateEncrypt } from 'crypto'

/** Conditional tests */
const itIf = (condition: boolean) => (condition ? it : it.skip)
const integrationTestsOn = hre.network.name == 'alfajores' || hre.network.name == 'ganache'

describe('MasterZTemplate', function () {
  let managerContract: Manager
  let owner: SignerWithAddress
  let donor: SignerWithAddress
  let partner: SignerWithAddress
  let masterzTemplateContract: MasterZTemplate

  beforeEach(async function () {
    ;[owner, donor, partner] = await ethers.getSigners()

    // deploy address book
    const addressBookFactory = await ethers.getContractFactory('AddressBook')
    const addressBookContract = (await addressBookFactory.deploy()) as AddressBook
    await addressBookContract.deployed()

    // deploy address book library
    const addressBookLibraryFactory = await ethers.getContractFactory('AddressBookLibrary')
    const addressBookLibraryContract = await addressBookLibraryFactory.deploy()
    await addressBookLibraryContract.deployed()

    // deploy manager
    const managerFactory = await ethers.getContractFactory('Manager')
    managerContract = (await managerFactory.deploy(addressBookContract.address)) as Manager
    await managerContract.deployed()

    // deploy MasterZTemplate
    const masterzTemplateFactory = await ethers.getContractFactory('MasterZTemplate', {
      libraries: {
        AddressBookLibrary: addressBookLibraryContract.address,
      },
    })
    masterzTemplateContract = (await masterzTemplateFactory.deploy()) as MasterZTemplate
    await (
      await addressBookContract.grantRole(
        await addressBookContract.MANAGER_DONOR_ROLE(),
        masterzTemplateContract.address,
      )
    ).wait()

    // Grant ADMIN partner role (required because we hardcode the partner at project creation)
    await (await addressBookContract.grantRole(await addressBookContract.PARTNER_ROLE(), owner.address)).wait()

    // transfer ownership of template to manager
    await (await masterzTemplateContract.transferOwnership(managerContract.address)).wait()
  })

  const participantAddress = '0x0000000000000000000000000000000000000000'
  async function deployProject() {
    const deadlineDays = BigNumber.from(1) // days
    await (
      await masterzTemplateContract
        .connect(owner)
        ['safeMint(address,uint256)'](participantAddress, deadlineDays, { gasLimit: 1000000 })
    ).wait()
  }

  describe('project creation', function () {
    // test on multiple projects
    it('Should create project', async function () {
      await deployProject()

      const projects = await masterzTemplateContract.connect(owner).listProjects()

      expect(projects.length).to.equal(1)
      expect(projects[0].projectState).to.equal(0)
      expect(projects[0].title).to.equal('Title')
      expect(projects[0].description).to.equal('Description')
      expect(projects[0].participant).to.equal(participantAddress)
      // TODO expect(projects[0][4]).to.equal(deadlineDays)
      expect(projects[0].checkpoints.length).equal(3)
      expect([...projects[0].checkpoints[0]]).deep.equal([
        0,
        'Checkpoint title',
        'Follow 80% of courses.',
        BigNumber.from(1),
        BigNumber.from(0),
      ])
    })

    it('Should create multiple projects', async function () {
      await deployProject()
      await deployProject()

      const projects = await masterzTemplateContract.connect(owner).listProjects()

      expect(projects.length).to.equal(2)
      expect(projects[0].projectState).to.equal(0)
      expect(projects[1].projectState).to.equal(0)
      expect(projects[0].title).to.equal('Title')
      expect(projects[1].title).to.equal('Title')
      expect(projects[0].description).to.equal('Description')
      expect(projects[1].description).to.equal('Description')
      expect(projects[0].participant).to.equal(participantAddress)
      expect(projects[1].participant).to.equal(participantAddress)
      // TODO expect(projects[0][4]).to.equal(deadlineDays)
      expect(projects[0].checkpoints.length).equal(3)
      expect(projects[1].checkpoints.length).equal(3)
      expect([...projects[0].checkpoints[0]]).deep.equal([
        0,
        'Checkpoint title',
        'Follow 80% of courses.',
        BigNumber.from(1),
        BigNumber.from(0),
      ])
      expect([...projects[1].checkpoints[0]]).deep.equal([
        0,
        'Checkpoint title',
        'Follow 80% of courses.',
        BigNumber.from(1),
        BigNumber.from(0),
      ])
    })
  })

  async function approveDonationToContract(): Promise<void> {
    const kit = Kit.newKit('http://localhost:8545')
    const cUSDtoken = await kit.contracts.getStableToken()
    await cUSDtoken
      .approve(masterzTemplateContract.address, '10000000000000000000000')
      .sendAndWaitForReceipt({ from: owner.address, gasPrice: 891536019 })
  }

  describe('funding', function () {
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

    itIf(integrationTestsOn)('Should not start non-existing project', async function () {
      await deployProject()
      await approveDonationToContract()
      await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('10'))).wait()
      expect(await masterzTemplateContract.connect(owner).startProject(1)).to.be.revertedWith('project does not exist')
    })

    itIf(integrationTestsOn)('Should not start project if not admin', async function () {
      await deployProject()
      await approveDonationToContract()
      await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('10'))).wait()
      expect(await masterzTemplateContract.connect(donor).startProject(0)).to.be.revertedWith(
        'only DEFAULT_ADMIN_ROLE can create templates',
      )
    })
  })

  describe('checkpoints', function () {
    itIf(integrationTestsOn)('First checkpoint should be the activated checkpoint', async function () {
      await deployProject()
      await approveDonationToContract()
      await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('10'))).wait()
      await (await masterzTemplateContract.connect(owner).startProject(0)).wait()
      const projects = await masterzTemplateContract.connect(owner).listProjects()
      const checkpoints = projects[0].checkpoints
      expect(projects[0].activeCheckpoint).equals(0) // check active checkpoint
      expect(checkpoints[0].state).equals(1) // check checkpoint status
    })

    itIf(integrationTestsOn)('Should start first checkpoint', async function () {
      await deployProject()
      await approveDonationToContract()
      await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('10'))).wait()
      await (await masterzTemplateContract.connect(owner).startProject(0)).wait()
      await (await masterzTemplateContract.connect(owner).startCheckPoint(0)).wait()
      const projects = await masterzTemplateContract.connect(owner).listProjects()
      const checkpoints = projects[0].checkpoints
      expect(projects[0].activeCheckpoint).equals(0) // check active checkpoint
      expect(checkpoints[0].state).equals(2) // check checkpoint status
    })

    itIf(integrationTestsOn)('Should not start checkpoint if not admin', async function () {
      await deployProject()
      await approveDonationToContract()
      await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('10'))).wait()
      await (await masterzTemplateContract.connect(owner).startProject(0)).wait()
      expect(await masterzTemplateContract.connect(donor).startCheckPoint(0)).to.be.revertedWith(
        'only DEFAULT_ADMIN_ROLE can create templates',
      )
    })

    // test with non-admin account
    itIf(integrationTestsOn)('Should finish first checkpoint', async function () {
      await deployProject()
      await approveDonationToContract()
      await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('10'))).wait()
      await (await masterzTemplateContract.connect(owner).startProject(0)).wait()
      await (await masterzTemplateContract.connect(owner).startCheckPoint(0)).wait()
      await (await masterzTemplateContract.connect(owner).finishCheckpoint(0)).wait()
      const projects = await masterzTemplateContract.connect(owner).listProjects()
      const checkpoints = projects[0].checkpoints
      expect(projects[0].projectState).equals(2) // check active checkpoint
      expect(projects[0].activeCheckpoint).equals(1) // check active checkpoint
      expect(checkpoints[0].state).equals(3) // check first checkpoint status
      expect(checkpoints[1].state).equals(1) // check second checkpoint status
    })

    // test with non-admin account
    itIf(integrationTestsOn)('Should not start second checkpoint', async function () {
      await deployProject()
      await approveDonationToContract()
      await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('10'))).wait()
      await (await masterzTemplateContract.connect(owner).startProject(0)).wait()
      expect(await masterzTemplateContract.connect(owner).startCheckPoint(1)).to.be.revertedWith(
        'Checkpoint not ready to start',
      )
    })

    // test with non-admin account
    itIf(integrationTestsOn)('Should start second checkpoint', async function () {
      await deployProject()
      await approveDonationToContract()
      await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('10'))).wait()
      await (await masterzTemplateContract.connect(owner).startProject(0)).wait()
      await (await masterzTemplateContract.connect(owner).startCheckPoint(0)).wait()
      await (await masterzTemplateContract.connect(owner).finishCheckpoint(0)).wait()
      await (await masterzTemplateContract.connect(owner).startCheckPoint(0)).wait()
      const projects = await masterzTemplateContract.connect(owner).listProjects()
      const checkpoints = projects[0].checkpoints
      expect(projects[0].projectState).equals(2)
      expect(projects[0].activeCheckpoint).equals(1) // check active checkpoint
      expect(checkpoints[1].state).equals(2) // check checkpoint status
    })

    itIf(integrationTestsOn)('Should finish second checkpoint', async function () {
      await deployProject()
      await approveDonationToContract()
      await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('10'))).wait()
      await (await masterzTemplateContract.connect(owner).startProject(0)).wait()
      await (await masterzTemplateContract.connect(owner).startCheckPoint(0)).wait()
      await (await masterzTemplateContract.connect(owner).finishCheckpoint(0)).wait()
      await (await masterzTemplateContract.connect(owner).startCheckPoint(0)).wait()
      await (await masterzTemplateContract.connect(owner).finishCheckpoint(0)).wait()
      const projects = await masterzTemplateContract.connect(owner).listProjects()
      const checkpoints = projects[0].checkpoints
      expect(projects[0].projectState).equals(2)
      expect(projects[0].activeCheckpoint).equals(2) // check active checkpoint
      expect(checkpoints[1].state).equals(3) // check checkpoint status
      expect(checkpoints[2].state).equals(1)
    })

    itIf(integrationTestsOn)('Should run entire campaign', async function () {
      await deployProject()
      await approveDonationToContract()
      await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('10'))).wait()
      await (await masterzTemplateContract.connect(owner).startProject(0)).wait()
      await (await masterzTemplateContract.connect(owner).startCheckPoint(0)).wait() // checkpoint 1
      await (await masterzTemplateContract.connect(owner).finishCheckpoint(0)).wait()
      await (await masterzTemplateContract.connect(owner).startCheckPoint(0)).wait() // checkpoint 2
      await (await masterzTemplateContract.connect(owner).finishCheckpoint(0)).wait()
      await (await masterzTemplateContract.connect(owner).startCheckPoint(0)).wait() // checkpoint 3
      await (await masterzTemplateContract.connect(owner).finishCheckpoint(0)).wait()
      const projects = await masterzTemplateContract.connect(owner).listProjects()
      const checkpoints = projects[0].checkpoints
      expect(projects[0].projectState).equals(3)
      expect(checkpoints[0].state).equals(3)
      expect(checkpoints[1].state).equals(3)
      expect(checkpoints[2].state).equals(3)
    })
  })

  describe('Abort', function () {
    itIf(integrationTestsOn)('Should kill project', async function () {
      await deployProject()
      await masterzTemplateContract.connect(owner).abortProject(0)
      expect(await masterzTemplateContract.connect(owner).getProjectStatus(0)).equals(4)
    })

    itIf(integrationTestsOn)('Should not accept funds if project aborted', async function () {
      await deployProject()
      await approveDonationToContract()
      await masterzTemplateContract.connect(owner).abortProject(0)
      expect(await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('1'))).to.be.revertedWith(
        'PS not correct',
      )
    })
  })
})
