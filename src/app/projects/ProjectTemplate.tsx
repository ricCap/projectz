import { Component, createResource, For, JSXElement, mergeProps, Show } from 'solid-js'
import { ConnectionPros as ConnectionProps } from '../App'

import { managerContract } from '../Navbar'

export const TemplatesTable: Component<ConnectionProps> = props => {
  const [projectTemplates] = createResource(props.connected, fetchProjectTemplates)

  return (
    <div>
      <Show when={props.connected()}>
        <Show
          when={!projectTemplates.loading && props.connected()}
          fallback={<div class="text-center">Loading templates</div>}
        >
          <div class="grid md:grid-cols-3">
            <For each={projectTemplates()}>
              {(templateName: string) => (
                <ProjectTemplate {...mergeProps(props)} address={templateName}></ProjectTemplate>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  )
}

async function fetchProjectTemplates(connected: boolean): Promise<string[]> {
  if (connected) {
    return await managerContract.methods.listProjectTemplates().call()
  }
  return []
}

interface ProjectTemplateProps extends ConnectionProps {
  address: string
}

export const ProjectTemplate: Component<ProjectTemplateProps> = props => {
  return (
    <div class="p-4 m-4 text-bold text-center bg-blue-100">
      <div class="grid grid-1">
        <p class="p-1">Template</p>
        <button type="button" class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 content-end w-auto">
          {props.locale().t('body.templates.button-create-project')}
        </button>
      </div>
    </div>
  )
}
