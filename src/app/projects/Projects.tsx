import { Accessor, Component, createSignal, For, Index, mergeProps, Setter, Show } from 'solid-js'
import { ProjectStruct } from '../../../typechain-types/projects/ExampleProjectTemplate.sol/ExampleProjectTemplate'
import * as masterzTemplate from '../../../typechain-types/projects/MasterZTemplate'

import { ProjectsProps } from './ProjectTemplate'
import { Project, ProjectDetails } from './MasterZProject'

// TODO remove this mock
const masterzProject: masterzTemplate.MasterZTemplate.ProjectStruct = {
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

export const ProjectsTable: Component<ProjectsProps> = props => {
  const [selectedProject, setSelectedProject] = createSignal<ProjectStruct>()

  return (
    <div>
      <h1 class="text-center text-3xl bg-blue-700 text-white py-2">Projects</h1>
      <div class="grid md:grid-cols-3">
        <For each={props.projects()}>
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
}
