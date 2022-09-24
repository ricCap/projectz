import { ethers } from 'hardhat'
import * as fs from 'fs'

export type DeployedAddresses = {
  Manager: string
  ExampleProjectTemplate: string
  MasterZTemplate: string
}

async function main() {
  const managerFactory = await ethers.getContractFactory('Manager')
  const managerContract = await managerFactory.deploy()
  await managerContract.deployed()
  console.log(`Manager deployed to ${managerContract.address}`)

  const exampleProjectTemplateFactory = await ethers.getContractFactory('ExampleProjectTemplate')
  const exampleProjectTemplateContract = await exampleProjectTemplateFactory.deploy()
  await exampleProjectTemplateContract.transferOwnership(managerContract.address)
  await managerContract.addProjectTemplate(exampleProjectTemplateContract.address)
  console.log(`Example template deployed to ${exampleProjectTemplateContract.address} and added to manager`)

  // deploy MasterZTemplate
  const masterzTemplateFactory = await ethers.getContractFactory('MasterZTemplate')
  const masterzTemplateContract = await masterzTemplateFactory.deploy()
  await await masterzTemplateContract.transferOwnership(managerContract.address)
  await managerContract.addProjectTemplate(masterzTemplateContract.address)
  console.log(`MasterZ template deployed to ${masterzTemplateContract.address} and added to manager`)

  // Store addresses into a file the app can use
  const addresses: DeployedAddresses = {
    Manager: managerContract.address,
    ExampleProjectTemplate: exampleProjectTemplateContract.address,
    MasterZTemplate: masterzTemplateContract.address,
  }

  fs.writeFileSync('./src/addresses.json', JSON.stringify(addresses, null, 2), 'utf8')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
