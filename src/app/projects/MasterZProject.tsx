import { Accessor, Component, createResource, createSignal, For, Setter, Show } from 'solid-js'

import MasterZTemplateABI from '../../../artifacts/contracts/projects/MasterZTemplate.sol/MasterZTemplate.json'
import * as masterzTemplate from '../../../typechain-types/projects/MasterZTemplate'
import { MasterZTemplate } from '../../types/contracts/projects/MasterZTemplate.sol/MasterZTemplate'
import { kit } from '../Navbar'
import { masterzProject } from './ExampleProject'
import { ProjectsProps } from './ProjectTemplate'

export const MasterZProjectTable: Component<ProjectsProps> = props => {
  const [selectedProject, setSelectedProject] = createSignal<masterzTemplate.MasterZTemplate.ProjectStruct>()
  const [projects, { refetch }] = createResource(props.selectedTemplate(), fetchProjects)

  return (
    <div>
      <div class="grid md:grid-cols-3">
        <For each={projects()}>
          {(project: masterzTemplate.MasterZTemplate.ProjectStruct) => (
            <Project
              project={project}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
            ></Project>
          )}
        </For>
      </div>
      <a id="project-details" />
      <Show when={selectedProject() !== undefined}>
        <ProjectDetails project={selectedProject()}></ProjectDetails>
      </Show>
    </div>
  )

  async function fetchProjects(
    templateAddress: string | undefined,
  ): Promise<masterzTemplate.MasterZTemplate.ProjectStruct[]> {
    if (props.connected() && templateAddress) {
      const contractAsMasterZTemplate = new kit.web3.eth.Contract(
        MasterZTemplateABI.abi as any,
        templateAddress,
      ) as unknown as MasterZTemplate

      const output: [string, string, string, string, string, [string, string, string, string, string][], string][] =
        await contractAsMasterZTemplate.methods.listProjects().call()
      return output.map(value => {
        const checkpointsListAsTuple = value[5]
        const checkpoints: masterzTemplate.MasterZTemplate.CheckpointStruct[] = []
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
          partecipant: value[3],
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
  project: masterzTemplate.MasterZTemplate.ProjectStruct
  selectedProject: Accessor<masterzTemplate.MasterZTemplate.ProjectStruct | undefined>
  setSelectedProject: Setter<masterzTemplate.MasterZTemplate.ProjectStruct | undefined>
}> = props => {
  return (
    <a href="#project-details">
      <div
        class="bg-sky-100 hover:bg-sky-200 m-6 p-2 cursor-pointer"
        onClick={() => props.setSelectedProject(props.project)}
      >
        <p class="text-center font-bold text-xl">{props.project.title}</p>
        <p>{props.project.description}</p>
        <p>{props.project.partecipant}</p>
        <img src="http://t1.gstatic.com/licensed-image?q=tbn:ANd9GcSxLr0EfOo_znMX-DYtQVeYFvNzAF4Xw3Ny8nm9RZqlS0QdgFMCBN81LtQxXfqj_1EviZSW9_zWBuBi6wLLtjA"></img>
      </div>
    </a>
  )
}

export const ProjectDetails: Component<{
  project: masterzTemplate.MasterZTemplate.ProjectStruct | undefined
}> = props => {
  const [selectedCheckpoint, setSelectedCheckpoint] = createSignal<masterzTemplate.MasterZTemplate.CheckpointStruct>()

  return (
    <div class="bg-blue-100">
      <div class="flex">
        <div class="m-4 text-center">
          <img
            class="rounded-full max-h-20"
            src="https://www.waldwissen.net/assets/wald/tiere/saeuger/lwf_farbhoernchen/lwf_farbhoernchen_dunkel.jpg"
          ></img>
        </div>
        <div class="text-bold text-2xl m-2 p-2">
          <span class="inline-block align-middle">Project for {props.project!.partecipant}</span>
        </div>
        <div>
          <button type="button" class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4">
            Donate
          </button>
        </div>
      </div>
      <div class="text-semibold text-xl w-fit p-2">
        A very long description about Mario's project and why you should donate
      </div>

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
          <For each={props.project!.checkpoints}>
            {(checkpoint: masterzTemplate.MasterZTemplate.CheckpointStruct) => (
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
  checkpoint: masterzTemplate.MasterZTemplate.CheckpointStruct
  selectedCheckpoint: Accessor<masterzTemplate.MasterZTemplate.CheckpointStruct | undefined>
  setSelectedCheckpoint: Setter<masterzTemplate.MasterZTemplate.CheckpointStruct>
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
  selectedCheckpoint: Accessor<masterzTemplate.MasterZTemplate.CheckpointStruct | undefined>
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
