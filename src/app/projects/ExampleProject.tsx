import { kit } from '../Navbar'

import ExampleProjectTemplateABI from '../../../artifacts/contracts/projects/ExampleProjectTemplate.sol/ExampleProjectTemplate.json'
import { ExampleProjectTemplate } from '../../types/contracts/projects/ExampleProjectTemplate.sol/ExampleProjectTemplate'
import { Component, createResource, createSignal, For, Show } from 'solid-js'
import { ProjectsProps } from './ProjectTemplate'
import { ProjectStruct } from '../../../typechain-types/projects/ExampleProjectTemplate.sol/ExampleProjectTemplate'
import { Project, ProjectDetails } from './MasterZProject'

import * as masterzTemplate from '../../../typechain-types/projects/MasterZTemplate'

// TODO remove this mock
export const masterzProject: masterzTemplate.MasterZTemplate.ProjectStruct = {
  projectState: 0,
  title: 'Title',
  description: 'Description',
  partecipant: 'Mario Rossi', // typo
  deadline: new Date().getTime(),
  checkpoints: [
    {
      state: 0,
      title: 'Psychologist',
      description: 'Checkpoint description',
      cost: 1,
      partnerID: 0,
    },
    {
      state: 1,
      title: 'Psychologist',
      description: 'Checkpoint description',
      cost: 1,
      partnerID: 0,
    },
  ],
  activeCheckpoint: 0,
}

export const ExampleProjectTable: Component<ProjectsProps> = props => {
  const [selectedProject, setSelectedProject] = createSignal<ProjectStruct>()
  const [projects, { refetch }] = createResource(props.selectedTemplate(), fetchProjectsForTemplate)

  return (
    <div>
      <div class="grid md:grid-cols-3">
        <For each={projects()}>
          {(project: ProjectStruct) => (
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
        {/* <ProjectDetails project={selectedProject()}></ProjectDetails> */}
        <ProjectDetails project={masterzProject}></ProjectDetails>
      </Show>
    </div>
  )

  async function fetchProjectsForTemplate(templateAddress: string | undefined): Promise<ProjectStruct[]> {
    if (props.connected() && templateAddress) {
      const exampleTemplateContract = new kit.web3.eth.Contract(
        ExampleProjectTemplateABI.abi as any,
        templateAddress,
      ) as unknown as ExampleProjectTemplate

      const output: [string, string][] = await exampleTemplateContract.methods.listProjects().call()
      return output.map(value => {
        return {
          title: value[0],
          description: value[1],
        }
      })
    }
    return []
  }
}
