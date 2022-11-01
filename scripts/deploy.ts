import { ethers } from 'hardhat'
import * as fs from 'fs'

import { AddressBook } from '../typechain-types/AddressBook'

export type DeployedAddresses = {
  AddressBook: string
  Manager: string
  ExampleProjectTemplate: string
  MasterZTemplate: string
  AddressBookLibrary: string
  ProjectLibrary: string
}

async function main() {
  const [admin] = await ethers.getSigners()

  const addressBookFactory = await ethers.getContractFactory('AddressBook')
  const addressBookContract = (await addressBookFactory.deploy()) as AddressBook
  await addressBookContract.deployed()
  console.log(`AddressBook deployed to ${addressBookContract.address}`)

  const managerFactory = await ethers.getContractFactory('Manager')
  const managerContract = await managerFactory.deploy(addressBookContract.address)
  await managerContract.deployed()
  console.log(`Manager deployed to ${managerContract.address}`)

  const exampleProjectTemplateFactory = await ethers.getContractFactory('ExampleProjectTemplate')
  const exampleProjectTemplateContract = await exampleProjectTemplateFactory.deploy()
  await exampleProjectTemplateContract.transferOwnership(managerContract.address)
  await (
    await addressBookContract.grantRole(
      await addressBookContract.MANAGER_DONOR_ROLE(),
      exampleProjectTemplateContract.address,
    )
  ).wait()
  await managerContract.addProjectTemplate(exampleProjectTemplateContract.address)
  console.log(`Example template deployed to ${exampleProjectTemplateContract.address} and added to manager`)

  const addressBookLibraryFactory = await ethers.getContractFactory('AddressBookLibrary')
  const addressBookLibraryContract = await addressBookLibraryFactory.deploy()
  await addressBookLibraryContract.deployed()
  console.log(`AddressBookLibrary deployed to ${addressBookLibraryContract.address}`)

  const projectLibraryFactory = await ethers.getContractFactory('ProjectLibrary')
  const projectLibraryContract = await projectLibraryFactory.deploy()
  await projectLibraryContract.deployed()
  console.log(`ProjectLibrary deployed to ${projectLibraryContract.address}`)

  const masterzTemplateFactory = await ethers.getContractFactory('MasterZTemplate', {
    libraries: {
      AddressBookLibrary: addressBookLibraryContract.address,
      ProjectLibrary: projectLibraryContract.address,
    },
  })
  const masterzTemplateContract = await masterzTemplateFactory.deploy('info message', 5)
  await masterzTemplateContract.transferOwnership(managerContract.address)
  await (
    await addressBookContract.grantRole(await addressBookContract.MANAGER_DONOR_ROLE(), masterzTemplateContract.address)
  ).wait()

  // Grant ADMIN partner role (required because we hardcode the partner at project creation)
  await (await addressBookContract.grantRole(await addressBookContract.PARTNER_ROLE(), admin.address)).wait()

  await managerContract.addProjectTemplate(masterzTemplateContract.address)
  console.log(`MasterZ template deployed to ${masterzTemplateContract.address} and added to manager`)

  // Store addresses into a file the app can use
  const addresses: DeployedAddresses = {
    AddressBook: addressBookContract.address,
    Manager: managerContract.address,
    ExampleProjectTemplate: exampleProjectTemplateContract.address,
    MasterZTemplate: masterzTemplateContract.address,
    AddressBookLibrary: addressBookLibraryContract.address,
    ProjectLibrary: projectLibraryContract.address,
  }

  fs.writeFileSync('./src/addresses.json', JSON.stringify(addresses, null, 2), 'utf8')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
