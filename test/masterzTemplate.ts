import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import { Manager } from '../typechain-types/Manager'
import { MasterZTemplate } from '../typechain-types/projects/MasterZTemplate.sol'
import { BigNumber } from '@ethersproject/bignumber'

import * as Kit from '@celo/contractkit'
import hre from 'hardhat'

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

    // deploy manager
    const managerFactory = await ethers.getContractFactory('Manager')
    managerContract = (await managerFactory.deploy()) as Manager
    await managerContract.deployed()

    // deploy MasterZTemplate
    const masterzTemplateFactory = await ethers.getContractFactory('MasterZTemplate')
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
      .approve(masterzTemplateContract.address, '10000000000000000')
      .sendAndWaitForReceipt({ from: owner.address, gasPrice: 391536019 })
  }

  itIf(integrationTestsOn)('Should fund project', async function () {
    await approveDonationToContract()
    await (await masterzTemplateContract.connect(owner).donate(BigNumber.from('0'), BigNumber.from('1'))).wait()
  })

  itIf(integrationTestsOn)('Should not reach hardcap with donation smaller than hardcap', async function () {
    await approveDonationToContract()
    const receipt = await (
      await masterzTemplateContract.connect(owner).donate(BigNumber.from('0'), BigNumber.from('1'))
    ).wait()
    console.log(receipt.events![1].args)
    expect(await masterzTemplateContract.getProjectStatus(0)).equals(0)
  })

  // itIf(integrationTestsOn)('Should start project', async function () {
  //   await approveDonationToContract()
  //   await (await masterzTemplateContract.connect(owner).donate(0, BigNumber.from('5'))).wait()
  //   await (await masterzTemplateContract.connect(owner).startProject(0)).wait()
  //   const projects = await masterzTemplateContract.connect(owner).listProjects()
  //   expect(projects[0][0]).to.equal(1)
  // })
})
