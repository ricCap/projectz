import { Accessor, Component, createResource, createSignal, For, mergeProps, Resource, Setter, Show } from 'solid-js'
import { ConnectionProps as ConnectionProps } from '../App'

import { ProjectsTable } from './Projects'
import { exampleTemplateContract, kit, managerContract } from '../Navbar'
import { ProjectStruct } from '../../../typechain-types/projects/ExampleProjectTemplate.sol/ExampleProjectTemplate'

import IProjectTemplateABI from '../../../artifacts/contracts/projects/IProjectTemplate.sol/IProjectTemplate.json'
import MasterZTemplateABI from '../../../artifacts/contracts/projects/MasterZTemplate.sol/MasterZTemplate.json'

import { IProjectTemplate } from '../../types/contracts/projects/IProjectTemplate'
import { MasterZTemplate } from '../../types/contracts/projects'
import Spinner from '../widgets/Spinner'

export interface ProjectsProps extends ConnectionProps {
  selectedTemplate: Accessor<string | undefined>
  setSelectedTemplate: Setter<string | undefined>
  projects: Resource<ProjectStruct[]>
  refetchProjects: (info?: unknown) => ProjectStruct[] | Promise<ProjectStruct[] | undefined> | null | undefined
}

export const TemplatesTable: Component<ConnectionProps> = props => {
  const [projectTemplates] = createResource(props.connected, fetchProjectTemplates)
  const [selectedTemplate, setSelectedTemplate] = createSignal<string | undefined>()
  const [projects, { refetch }] = createResource(selectedTemplate, fetchProjectsForTemplate)

  const projectProps: ProjectsProps = mergeProps(props, {
    selectedTemplate: selectedTemplate,
    setSelectedTemplate: setSelectedTemplate,
    projects: projects,
    refetchProjects: refetch,
  })

  return (
    <div>
      <Show when={props.connected()}>
        <h1 class="text-center text-3xl bg-blue-700 text-white py-2">Templates</h1>
        <Show when={!projectTemplates.loading && props.connected()} fallback={<Spinner></Spinner>}>
          <div class="grid md:grid-cols-3">
            <For each={projectTemplates()}>
              {(templateName: string) => <ProjectTemplate {...projectProps} address={templateName}></ProjectTemplate>}
            </For>
          </div>
        </Show>
        <Show when={selectedTemplate()}>
          <ProjectsTable {...projectProps}></ProjectsTable>
        </Show>
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
  const [templateInfo] = createResource(props.address, getTemplateInfo)

  async function createProjectFromTemplate() {
    props.setMessage('Please approve the transaction in your wallet')
    await exampleTemplateContract.methods['safeMint((string,string))'](['hi', 'hi']).send({
      from: kit.defaultAccount,
    })
    // TODO check for transaction status
    props.setMessage('Transaction completed')
  }

  async function getTemplateInfo(address: string): Promise<string> {
    const contractAsIProjectTemplate = new kit.web3.eth.Contract(
      IProjectTemplateABI.abi as any,
      address,
    ) as unknown as IProjectTemplate

    const IID = await exampleTemplateContract.methods.IID().call()
    const isExampleTemplateContract = await contractAsIProjectTemplate.methods.supportsInterface(IID).call()
    if (isExampleTemplateContract) {
      return 'ExampleTemplateContract'
    } else {
      const contractAsMasterZTemplate = new kit.web3.eth.Contract(
        MasterZTemplateABI.abi as any,
        address,
      ) as unknown as MasterZTemplate

      return await contractAsMasterZTemplate.methods.getInfo().call()
    }
    return 'Unknown template'
  }

  return (
    <div class="p-4 m-4 text-bold text-center bg-blue-100">
      <div class="grid grid-cols-2 align-center">
        <p class="m-2 col-span-2 text-bold text-xl">{templateInfo}</p>
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
