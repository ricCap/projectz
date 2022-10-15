import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import '@nomiclabs/hardhat-ethers'

import { AddressBook } from '../typechain-types/AddressBook'

describe('AddressBook', function () {
  this.timeout(50000)

  let addressBookContract: AddressBook
  let owner: SignerWithAddress
  let addr1: SignerWithAddress
  let addr2: SignerWithAddress

  this.beforeEach(async function () {
    ;[owner, addr1, addr2] = await ethers.getSigners()

    // deploy address book
    const addressBookFactory = await ethers.getContractFactory('AddressBook')
    addressBookContract = (await addressBookFactory.deploy()) as AddressBook
    await addressBookContract.deployed()
  })

  it('should grant contract deployer DEFAULT_ADMIN_ROLE role', async function () {
    const defaultAdminRole = await addressBookContract.DEFAULT_ADMIN_ROLE()
    expect(await addressBookContract.hasRole(defaultAdminRole, owner.address)).to.equal(true)
  })

  describe('add user', function () {
    it('should allow DEFAULT_ADMIN_ROLE to add user', async function () {
      expect(await addressBookContract.addUser(addr1.address))
        .to.emit(addressBookContract, 'UserAdded')
        .withArgs(1, addr1.address)
    })

    it('should not allow non-DEFAULT_ADMIN_ROLE to add user', async function () {
      expect(async () => await addressBookContract.connect(addr1).addUser(addr1.address)).to.revertedWith(
        'only admin can add users',
      )
    })
  })

  describe('get address', () => {
    it('should succeed for known address', async function () {
      expect(await addressBookContract.getAddress(0)).to.equals(owner.address)
    })

    it('should fail for unkown address', async function () {
      expect(async () => await addressBookContract.getAddress(1)).to.revertedWith('user does not exist')
    })
  })

  describe('get user id', () => {
    it('should succeed for DEFAULT_ADMIN_USER', async function () {
      expect(await addressBookContract.getUserId(owner.address)).to.equals(0)
    })

    it('should succeed for known user', async function () {
      await addressBookContract.addUser(addr1.address)
      expect(await addressBookContract.getUserId(addr1.address)).to.equals(1)
    })

    it('should fail when getting id from unkown user', async function () {
      expect(async () => await addressBookContract.getUserId(addr1.address)).to.revertedWith('unkown user')
    })
  })

  describe('update address', function () {
    it('allows user to update own address', async function () {
      await addressBookContract.addUser(addr1.address)
      expect(await addressBookContract.connect(addr1).updateAddress(addr2.address))
        .to.emit(addressBookContract, 'UserAddressUpdated')
        .withArgs(1, addr1.address, addr2.address)
    })

    it('does not allow user to update other user address', async function () {
      await addressBookContract.addUser(addr1.address)
      await addressBookContract.addUser(addr2.address)
      expect(await addressBookContract.connect(addr1).updateAddress(addr2.address))
        .to.revertedWith('you can only update your own address')
        .to.not.emit(addressBookContract, 'RoleGranted')
    })

    it('should delegate user role to new address', async () => {
      const partnerRole = await addressBookContract.PARTNER_ROLE()
      await addressBookContract.addUser(addr1.address)
      await addressBookContract.grantRole(partnerRole, addr1.address)
      expect(await addressBookContract.connect(addr1).updateAddress(addr2.address))
        .to.emit(addressBookContract, 'RoleGranted')
        .withArgs(partnerRole, addr2.address)
    })
  })
})
