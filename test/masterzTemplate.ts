import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import { Manager } from '../typechain-types/Manager'
import { MasterZTemplate } from '../typechain-types/projects/MasterZTemplate'
import { BigNumber } from '@ethersproject/bignumber'

describe('MasterZTemplate', function () {
  let managerContract: Manager
  let owner: SignerWithAddress
  let masterzTemplateContract: MasterZTemplate

  this.beforeEach(async function () {
    ;[owner] = await ethers.getSigners()

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

  it('Should create project', async function () {
    const deadlineDays = BigNumber.from(1) // days
    const partecipantAddress = '0x0000000000000000000000000000000000000000'
    await (
      await masterzTemplateContract
        .connect(owner)
        ['safeMint(address,uint256)'](partecipantAddress, deadlineDays, { gasLimit: 1000000 })
    ).wait()

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
})
