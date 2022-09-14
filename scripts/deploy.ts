import { ethers } from 'hardhat'

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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
