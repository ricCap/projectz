import { kit } from '../Navbar'

import ExampleProjectTemplateABI from '../../../artifacts/contracts/projects/ExampleProjectTemplate.sol/ExampleProjectTemplate.json'
import { ExampleProjectTemplate } from '../../types/contracts/projects/ExampleProjectTemplate.sol/ExampleProjectTemplate'
import { Accessor, Component, createResource, createSignal, For, Setter, Show } from 'solid-js'
import { ProjectsProps } from './ProjectTemplate'
import { ProjectStruct } from '../../../typechain-types/projects/ExampleProjectTemplate.sol/ExampleProjectTemplate'

export const ExampleProjectTable: Component<ProjectsProps> = props => {
  const [selectedProject, setSelectedProject] = createSignal<ProjectStruct>()
  const [selectedProjectIndex, setSelectedProjectIndex] = createSignal<number>()
  const [projects, { refetch }] = createResource(props.selectedTemplate(), fetchProjectsForTemplate)

  return (
    <div>
      <div class="grid md:grid-cols-3">
        <For each={projects()}>
          {(project: ProjectStruct, index: Accessor<number>) => (
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
      <Show when={selectedProject() !== undefined}>
        <div>Project details</div>
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

export const Project: Component<{
  project: ProjectStruct
  projectIndex: number
  selectedProject: Accessor<ProjectStruct | undefined>
  setSelectedProject: Setter<ProjectStruct>
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
        <img src="http://t1.gstatic.com/licensed-image?q=tbn:ANd9GcSxLr0EfOo_znMX-DYtQVeYFvNzAF4Xw3Ny8nm9RZqlS0QdgFMCBN81LtQxXfqj_1EviZSW9_zWBuBi6wLLtjA"></img>
      </div>
    </a>
  )
}
