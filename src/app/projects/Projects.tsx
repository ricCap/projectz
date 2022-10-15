import { Component, Match, mergeProps, Switch } from 'solid-js'

import { ProjectsProps } from './ProjectTemplate'
import * as constants from '../constants'
import { ExampleProjectTable } from './ExampleProject'
import { MasterZProjectTable } from './MasterZProject'

export const ProjectsTable: Component<ProjectsProps> = props => {
  return (
    <div>
      <h1 class="text-center text-3xl bg-blue-700 text-white py-2">Projects</h1>
      <Switch>
        <Match when={props.selectedTemplate() === constants.addresses.ExampleProjectTemplate}>
          <ExampleProjectTable {...mergeProps(props)}></ExampleProjectTable>
        </Match>
        <Match when={props.selectedTemplate() === constants.addresses.MasterZTemplate}>
          <MasterZProjectTable {...mergeProps(props)}></MasterZProjectTable>
        </Match>
      </Switch>
    </div>
  )
}
