import { Accessor, Component, createResource, createSignal, For, mergeProps, Resource, Setter, Show } from 'solid-js'
import { ConnectionProps as ConnectionProps } from '../App'

import { ProjectsTable } from './Projects'
import { exampleTemplateContract, kit, managerContract } from '../Navbar'
import Spinner from '../widgets/Spinner'

import IProjectTemplateABI from '../../../artifacts/contracts/projects/IProjectTemplate.sol/IProjectTemplate.json'
import MasterZTemplateABI from '../../../artifacts/contracts/projects/MasterZTemplate.sol/MasterZTemplate.json'
import ExampleProjectTemplateABI from '../../../artifacts/contracts/projects/ExampleProjectTemplate.sol/ExampleProjectTemplate.json'

import { ExampleProjectTemplate } from '../../types/contracts/projects/ExampleProjectTemplate.sol'
import { IProjectTemplate } from '../../types/contracts/projects/IProjectTemplate'
import { MasterZTemplate } from '../../types/contracts/projects/MasterZTemplate.sol/MasterZTemplate'

import * as constants from '../constants'

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

  async function createProjectFromTemplate(address: string) {
    props.setMessage('Please approve the transaction in your wallet')

    if (address === constants.addresses.ExampleProjectTemplate.address) {
      const receipt = await exampleTemplateContract.methods['safeMint((string,string))'](['hi', 'hi']).send({
        from: kit.defaultAccount,
      })
      props.setMessage(`Transaction completed: ${receipt.logs}, ${receipt.status}`)
    } else {
      const contractAsMasterZTemplate = new kit.web3.eth.Contract(
        MasterZTemplateABI.abi as any,
        address,
      ) as unknown as MasterZTemplate
      const receipt = await contractAsMasterZTemplate.methods['safeMint(address,uint256)'](
        '0x0000000000000000000000000000000000000000',
        1,
      ).send({
        from: kit.defaultAccount,
      })
      props.setMessage(`Transaction completed: ${receipt.logs}, ${receipt.status}`)
    }
  }

  async function getTemplateInfo(address: string): Promise<string> {
    const contractAsIProjectTemplate = new kit.web3.eth.Contract(
      IProjectTemplateABI.abi as any,
      address,
    ) as unknown as IProjectTemplate

    // Can we just check the address maybe?
    if (
      await contractAsIProjectTemplate.methods.supportsInterface(constants.addresses.ExampleProjectTemplate.iid).call()
    ) {
      const contractExampleProjectTemplate = new kit.web3.eth.Contract(
        ExampleProjectTemplateABI.abi as any,
        address,
      ) as unknown as ExampleProjectTemplate

      return await contractExampleProjectTemplate.methods.symbol().call()
    }
    if (await contractAsIProjectTemplate.methods.supportsInterface(constants.addresses.MasterZTemplate.iid).call()) {
      const contractAsMasterZTemplate = new kit.web3.eth.Contract(
        MasterZTemplateABI.abi as any,
        address,
      ) as unknown as MasterZTemplate

      return await contractAsMasterZTemplate.methods.getInfo().call()
    } else {
      return 'Unknown template'
    }
  }

  return (
    <div class="p-4 m-4 text-bold text-center bg-blue-100">
      <div class="grid grid-cols-2 align-center">
        <Show when={!templateInfo.loading} fallback={<Spinner></Spinner>}>
          <p class="m-2 col-span-2 text-bold text-xl">{templateInfo}</p>
        </Show>
        <div class="">
          <button
            type="button"
            class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 content-end w-fit"
            onClick={() => createProjectFromTemplate(props.address)}
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
