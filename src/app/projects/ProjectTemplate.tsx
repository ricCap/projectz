import { Accessor, Component, createResource, createSignal, For, mergeProps, Resource, Setter, Show } from 'solid-js'
import { ConnectionProps as ConnectionProps } from '../App'

import { ProjectsTable } from './Projects'
import { exampleTemplateContract, kit, managerContract } from '../Navbar'
import { ProjectStruct } from '../../../typechain-types/projects/ExampleProjectTemplate.sol/ExampleProjectTemplate'

export interface ProjectsProps extends ConnectionProps {
  selectedTemplate: Accessor<string | undefined>
  setSelectedTemplate: Setter<string | undefined>
  projects: Resource<ProjectStruct[]>
  refetchProjects: (info?: unknown) => ProjectStruct[] | Promise<ProjectStruct[] | undefined> | null | undefined
}

export const TemplatesTable: Component<ConnectionProps> = props => {
  const [projectTemplates] = createResource(props.connected, fetchProjectTemplates)
  const [selectedTemplate, setSelectedTemplate] = createSignal<string | undefined>()
  const [projects, { mutate, refetch }] = createResource(selectedTemplate, fetchProjectsForTemplate)

  const projectProps: ProjectsProps = mergeProps(props, {
    selectedTemplate: selectedTemplate,
    setSelectedTemplate: setSelectedTemplate,
    projects: projects,
    refetchProjects: refetch,
  })

  return (
    <div>
      <Show when={props.connected()}>
        <Show
          when={!projectTemplates.loading && props.connected()}
          fallback={<div class="text-center">Loading templates</div>}
        >
          <div class="grid md:grid-cols-3">
            <For each={projectTemplates()}>
              {(templateName: string) => <ProjectTemplate {...projectProps} address={templateName}></ProjectTemplate>}
            </For>
          </div>
        </Show>
        <ProjectsTable {...projectProps}></ProjectsTable>
      </Show>
    </div>
  )

  async function fetchProjectsForTemplate(templateAddress: string): Promise<ProjectStruct[]> {
    if (props.connected()) {
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

async function fetchProjectTemplates(connected: boolean): Promise<string[]> {
  if (connected) {
    return await managerContract.methods.listProjectTemplates().call()
  }
  return []
}

interface ProjectTemplateProps extends ProjectsProps {
  address: string
}

export const ProjectTemplate: Component<ProjectTemplateProps> = props => {
  async function createProjectFromTemplate() {
    props.setMessage('Please approve the transaction in your wallet')
    await exampleTemplateContract.methods['safeMint((string,string))'](['hi', 'hi']).send({
      from: kit.defaultAccount,
    })
    // TODO check for transaction status
    props.setMessage('Transaction completed')
  }

  return (
    <div class="p-4 m-4 text-bold text-center bg-blue-100">
      <div class="grid grid-cols-2 align-center">
        <p class="m-2 col-span-2 text-bold text-xl">Template</p>
        <div class="">
          <button
            type="button"
            class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 content-end w-fit"
            onClick={() => createProjectFromTemplate()}
          >
            {props.locale().t('body.templates.button-create-project')}
          </button>
        </div>
        <div class="">
          <button
            type="button"
            class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 content-end w-fit"
            onClick={() => {
              props.setMessage(`Template selected ${props.address}`)
              props.setSelectedTemplate(props.address)
              if (props.selectedTemplate() === props.address) {
                props.refetchProjects()
              }
            }}
          >
            {props.locale().t('body.templates.button-see-project')}
          </button>
        </div>
      </div>
    </div>
  )
}
