import { ethers } from 'hardhat'
import * as fs from 'fs'
import { ExampleProjectTemplate, MasterZTemplate } from '../typechain-types'

export type DeployedContract = {
  address: string
  iid: string
}

export type DeployedAddresses = {
  Manager: string
  ExampleProjectTemplate: DeployedContract
  MasterZTemplate: DeployedContract
}

async function main() {
  const managerFactory = await ethers.getContractFactory('Manager')
  const managerContract = await managerFactory.deploy()
  await managerContract.deployed()
  console.log(`Manager deployed to ${managerContract.address}`)

  const exampleProjectTemplateFactory = await ethers.getContractFactory('ExampleProjectTemplate')
  const exampleProjectTemplateContract = await exampleProjectTemplateFactory.deploy()
  const exampleProjectTemplateiId = await (exampleProjectTemplateContract as ExampleProjectTemplate).iId()
  await exampleProjectTemplateContract.transferOwnership(managerContract.address)
  await managerContract.addProjectTemplate(exampleProjectTemplateContract.address)
  console.log(`Example template deployed to ${exampleProjectTemplateContract.address} and added to manager`)

  // deploy MasterZTemplate
  const masterzTemplateFactory = await ethers.getContractFactory('MasterZTemplate')
  const masterzTemplateContract = await masterzTemplateFactory.deploy()
  const masterzTemplateContractiId = await (masterzTemplateContract as MasterZTemplate).iId()
  await masterzTemplateContract.transferOwnership(managerContract.address)
  await managerContract.addProjectTemplate(masterzTemplateContract.address)
  console.log(`MasterZ template deployed to ${masterzTemplateContract.address} and added to manager`)

  // Store addresses into a file the app can use
  const addresses: DeployedAddresses = {
    Manager: managerContract.address,
    ExampleProjectTemplate: {
      address: exampleProjectTemplateContract.address,
      iid: exampleProjectTemplateiId,
    },
    MasterZTemplate: {
      address: masterzTemplateContract.address,
      iid: masterzTemplateContractiId,
    },
  }

  fs.writeFileSync('./src/addresses.json', JSON.stringify(addresses, null, 2), 'utf8')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
