import { Accessor, Component, createResource, createSignal, For, mergeProps, Setter, Show } from 'solid-js'

import MasterZTemplateABI from '../../../artifacts/contracts/projects/MasterZTemplate.sol/MasterZTemplate.json'
import * as masterzTemplate from '../../../typechain-types/projects/MasterZTemplate'
import { MasterZTemplate } from '../../types/contracts/projects/MasterZTemplate'
import { kit } from '../Navbar'
import { ProjectsProps } from './ProjectTemplate'
import * as constants from '../constants'

export const MasterZProjectTable: Component<ProjectsProps> = props => {
  const [selectedProject, setSelectedProject] = createSignal<masterzTemplate.ProjectStruct>()
  const [selectedProjectIndex, setSelectedProjectIndex] = createSignal<number>()
  const [projects, { refetch }] = createResource(props.selectedTemplate(), fetchProjects)

  return (
    <div>
      <div class="grid md:grid-cols-3">
        <For each={projects()}>
          {(project: masterzTemplate.ProjectStruct, index: Accessor<number>) => (
            <Project
              project={project}
              projectIndex={index()}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              selectedProjectIndex={selectedProjectIndex}
              setSelectedProjectIndex={setSelectedProjectIndex}
            ></Project>
          )}
        </For>
      </div>
      <a id="project-details" />
      <Show when={selectedProjectIndex() !== undefined}>
        <ProjectDetails
          {...mergeProps(props)}
          selectedProject={selectedProject}
          selectedProjectIndex={selectedProjectIndex}
        ></ProjectDetails>
      </Show>
    </div>
  )

  async function fetchProjects(templateAddress: string | undefined): Promise<masterzTemplate.ProjectStruct[]> {
    if (props.connected() && templateAddress) {
      const contractAsMasterZTemplate = new kit.web3.eth.Contract(
        MasterZTemplateABI.abi as any,
        templateAddress,
      ) as unknown as MasterZTemplate

      const output: [string, string, string, string, string, [string, string, string, string, string][], string][] =
        await contractAsMasterZTemplate.methods.listProjects().call()
      return output.map(value => {
        const checkpointsListAsTuple = value[5]
        const checkpoints: masterzTemplate.CheckpointStruct[] = []
        for (const checkpoint of checkpointsListAsTuple) {
          checkpoints.push({
            state: checkpoint[0],
            title: checkpoint[1],
            description: checkpoint[2],
            cost: checkpoint[3],
            partnerID: checkpoint[4],
          })
        }

        return {
          projectState: value[0],
          title: value[1],
          description: value[2],
          participant: value[3],
          deadline: value[4],
          checkpoints: checkpoints,
          activeCheckpoint: value[6],
        }
      })
    }
    return []
  }
}

export const Project: Component<{
  project: masterzTemplate.ProjectStruct
  projectIndex: number
  selectedProject: Accessor<masterzTemplate.ProjectStruct | undefined>
  setSelectedProject: Setter<masterzTemplate.ProjectStruct>
  selectedProjectIndex: Accessor<number | undefined>
  setSelectedProjectIndex: Setter<number | undefined>
}> = props => {
  return (
    <a href="#project-details">
      <div
        class="bg-sky-100 hover:bg-sky-200 m-6 p-2 cursor-pointer"
        onClick={() => {
          props.setSelectedProject(props.project)
          props.setSelectedProjectIndex(props.projectIndex)
        }}
      >
        <p class="text-center font-bold text-xl">{props.project.title}</p>
        <p>{props.project.description}</p>
        <p>{props.project.participant}</p>
        <img src="http://t1.gstatic.com/licensed-image?q=tbn:ANd9GcSxLr0EfOo_znMX-DYtQVeYFvNzAF4Xw3Ny8nm9RZqlS0QdgFMCBN81LtQxXfqj_1EviZSW9_zWBuBi6wLLtjA"></img>
      </div>
    </a>
  )
}

export const ProjectDetails: Component<
  ProjectsProps & {
    selectedProject: Accessor<masterzTemplate.ProjectStruct | undefined>
    selectedProjectIndex: Accessor<number | undefined>
  }
> = props => {
  const [selectedCheckpoint, setSelectedCheckpoint] = createSignal<masterzTemplate.CheckpointStruct>()

  const [projectBalance, _] = createResource(async () => {
    const cUSDtoken = await kit.contracts.getStableToken()
    return (await cUSDtoken.balanceOf(props.selectedTemplate()!)).shiftedBy(-constants.ERC20_DECIMALS).toFixed(2)
  })

  async function approveDonationToContract(): Promise<void> {
    const cUSDtoken = await kit.contracts.getStableToken()
    console.log(cUSDtoken.address)
    console.log(await cUSDtoken.balanceOf(kit.defaultAccount!))
    const receipt = await cUSDtoken
      .approve(props.selectedTemplate()!, '100000000000000000')
      .sendAndWaitForReceipt({ from: kit.defaultAccount, gas: 1000000 })
    console.log(await cUSDtoken.balanceOf(kit.defaultAccount!))
    console.log(receipt.transactionHash)
    console.log(receipt.logs)
  }

  async function donate(): Promise<void> {
    const contractAsMasterZTemplate = new kit.web3.eth.Contract(
      MasterZTemplateABI.abi as any,
      props.selectedTemplate(),
    ) as unknown as MasterZTemplate

    const receipt = await contractAsMasterZTemplate.methods
      .donate(props.selectedProjectIndex()!, '10000000000000000')
      .send({
        from: kit.defaultAccount,
        gas: 1000000,
      })
    console.log(receipt.transactionHash)
    console.log(receipt.logs)
  }

  async function startProject(): Promise<void> {
    const contractAsMasterZTemplate = new kit.web3.eth.Contract(
      MasterZTemplateABI.abi as any,
      props.selectedTemplate(),
    ) as unknown as MasterZTemplate

    await contractAsMasterZTemplate.methods.startProject(props.selectedProjectIndex()!).send({
      from: kit.defaultAccount,
      gas: 1000000,
    })
  }

  return (
    <div class="bg-blue-100 m-6">
      <div class="flex">
        <div class="m-4 text-center">
          <img
            class="rounded-full max-h-20"
            src="https://www.waldwissen.net/assets/wald/tiere/saeuger/lwf_farbhoernchen/lwf_farbhoernchen_dunkel.jpg"
          ></img>
        </div>
        <div class="text-bold text-2xl m-2 p-2">
          <span class="inline-block align-middle">Project for {props.selectedProject()!.participant}</span>
        </div>
        <div>
          <button
            type="button"
            class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4"
            onclick={async () => {
              props.setMessage(`Please approve the donation to this address: ${props.selectedTemplate()}`)
              await approveDonationToContract()
              await donate()
            }}
          >
            Donate
          </button>
          <button
            type="button"
            class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4"
            onclick={async () => {
              await startProject()
            }}
          >
            Start
          </button>
        </div>
      </div>
      <div class="text-semibold text-xl w-fit p-2">{props.selectedProject()?.description}</div>

      <div>Balance: {projectBalance()}</div>
      <div>Active checkpoint: {props.selectedProject()?.activeCheckpoint}</div>
      <div>State: {props.selectedProject()?.projectState}</div>
      <div>Deadline: {props.selectedProject()?.deadline}</div>
      <div>Participant: {props.selectedProject()?.participant}</div>

      <div class="w-1/2 p-2">
        <div class="flex justify-between mb-1">
          <span class="text-base font-medium text-blue-700">Checkpoints</span>
          <span class="text-sm font-medium text-blue-700">45%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div class="bg-blue-600 h-2.5 rounded-full" style="width: 45%"></div>
        </div>
      </div>
      <div class="flex">
        <div class="m-2">
          <For each={props.selectedProject()!.checkpoints}>
            {(checkpoint: masterzTemplate.CheckpointStruct) => (
              <Checkpoint
                checkpoint={checkpoint}
                selectedCheckpoint={selectedCheckpoint}
                setSelectedCheckpoint={setSelectedCheckpoint}
              ></Checkpoint>
            )}
          </For>
        </div>
        <CheckpointDetails selectedCheckpoint={selectedCheckpoint}></CheckpointDetails>
      </div>
    </div>
  )
}

const Checkpoint: Component<{
  checkpoint: masterzTemplate.CheckpointStruct
  selectedCheckpoint: Accessor<masterzTemplate.CheckpointStruct | undefined>
  setSelectedCheckpoint: Setter<masterzTemplate.CheckpointStruct>
}> = props => {
  return (
    <div>
      <div class="flex items-center mb-4">
        <input
          checked={(function () {
            if (props.checkpoint.state === 1) {
              props.setSelectedCheckpoint(props.checkpoint)
              return true
            }
            return false
          })()}
          type="radio"
          value=""
          name="default-radio"
          onChange={() => props.setSelectedCheckpoint(props.checkpoint)}
          class="w-4 h-4 text-blue-600 bg-blue-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
        ></input>
        <label for="default-radio-1" class="ml-2 text-sm font-medium text-gray-900">
          {props.checkpoint.title}
        </label>
      </div>
    </div>
  )
}

const CheckpointDetails: Component<{
  selectedCheckpoint: Accessor<masterzTemplate.CheckpointStruct | undefined>
}> = props => {
  return (
    <Show when={props.selectedCheckpoint()}>
      <div class="m-2">
        <p>Partner: {props.selectedCheckpoint()?.partnerID}</p>
        <p>State: {props.selectedCheckpoint()?.state}</p>
        <p>cUSD: {props.selectedCheckpoint()?.cost}</p>
      </div>
    </Show>
  )
}
