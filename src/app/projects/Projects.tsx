import { Component, For } from 'solid-js'
import { ProjectStruct } from '../../../typechain-types/projects/ExampleProjectTemplate.sol/ExampleProjectTemplate'

import { ProjectsProps } from './ProjectTemplate'

export const ProjectsTable: Component<ProjectsProps> = props => {
  return (
    <div>
      <h1 class="text-center text-3xl bg-blue-700 text-white py-2">Projects</h1>
      <div class="grid md:grid-cols-3">
        <For each={props.projects()}>{(project: ProjectStruct) => <Project project={project}></Project>}</For>
      </div>
    </div>
  )
}

const Project: Component<{
  project: ProjectStruct
}> = props => {
  return (
    <div class="bg-sky-100 rounded-md m-6 p-2">
      <p class="text-center font-bold text-xl">{props.project.title}</p>
      <p>{props.project.description}</p>
      <img src="http://t1.gstatic.com/licensed-image?q=tbn:ANd9GcSxLr0EfOo_znMX-DYtQVeYFvNzAF4Xw3Ny8nm9RZqlS0QdgFMCBN81LtQxXfqj_1EviZSW9_zWBuBi6wLLtjA"></img>
    </div>
  )
}
