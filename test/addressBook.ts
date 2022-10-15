import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import '@nomiclabs/hardhat-ethers'

import { AddressBook } from '../typechain-types/AddressBook'

describe('AddressBook', function () {
  this.timeout(50000)

  let addressBookContract: AddressBook
  let owner: SignerWithAddress

  this.beforeEach(async function () {
    ;[owner] = await ethers.getSigners()

    // deploy address book
    const addressBookFactory = await ethers.getContractFactory('AddressBook')
    addressBookContract = (await addressBookFactory.deploy()) as AddressBook
    await addressBookContract.deployed()
  })

  it('should grant contract deployer DEFAULT_ADMIN_ROLE role', async function () {
    const defaultAdminRole = await addressBookContract.DEFAULT_ADMIN_ROLE()
    expect(await addressBookContract.hasRole(defaultAdminRole, owner.address)).to.equal(true)
  })
})
