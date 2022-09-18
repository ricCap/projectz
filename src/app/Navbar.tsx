import Polyglot from 'node-polyglot'
import { Accessor, JSXElement, mergeProps, Setter, Show, Signal } from 'solid-js'

import { AbiItem } from 'web3-utils'
import * as contractkit from '@celo/contractkit'
import Web3 from '@celo/contractkit/node_modules/web3'
import WalletConnectProvider from '@walletconnect/web3-provider'

import { getI18N } from './i18n'
import * as constants from './constants'
import managerABI from '../../artifacts/contracts/Manager.sol/Manager.json'
import { Manager } from '../types/contracts/Manager'
import { ExampleProjectTemplate } from '../types/contracts/projects'

export let kit: contractkit.ContractKit
export let managerContract: Manager
export let exampleTemplateContract: ExampleProjectTemplate

/** Global interface required to interact with window.celo */
declare global {
  interface window {
    celo: any
  }
}

interface INavbarProps {
  connected: Accessor<boolean>
  setConnected: Setter<boolean>
  locale: Accessor<Polyglot>
  setLocale: Setter<Polyglot>
  message: Accessor<string>
  setMessage: Setter<string>
}

const WalletsDropdown = (props: INavbarProps) => {
  return (
    <div class="group">
      <button type="button" class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 content-end">
        {props.locale().t('navbar.button-connect')}
      </button>
      <div class="hidden group-hover:flex absolute z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
        <ul class="py-1 text-sm text-gray-700 dark:text-gray-400" aria-labelledby="dropdownNavbarButton">
          <li>
            <button
              onClick={() => connectWalletConnect(props)}
              class="block py-2 px-4 w-full hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              {props.locale().t('navbar.button-connect-wallet-connect')}
            </button>
          </li>
          <li>
            <button
              onClick={() => connectCeloWallet(props)}
              class="block py-2 px-4 w-full hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              {props.locale().t('navbar.button-connect-extension')}
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default function Navbar(props: INavbarProps): JSXElement {
  return (
    <>
      <div class="container w-full flex flex-row bg-blue-700">
        <div class="grow"></div>
        <Show
          when={props.connected()}
          fallback={
            <>
              <WalletsDropdown {...mergeProps(props)}></WalletsDropdown>
            </>
          }
        >
          <button
            type="button"
            class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 content-end"
            onClick={() => disconnect(props)}
          >
            {props.locale().t('navbar.button-disconnect')}
          </button>
        </Show>
        <Show
          when={props.locale().locale() === 'en'}
          fallback={
            <>
              <button
                type="button"
                class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 content-end"
                onClick={() => props.setLocale(getI18N('en'))}
              >
                {props.locale().t('navbar.button-switch-language')}
              </button>
            </>
          }
        >
          <button
            type="button"
            class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 content-end"
            onClick={() => props.setLocale(getI18N('it'))}
          >
            {props.locale().t('navbar.button-switch-language')}
          </button>
        </Show>
      </div>
      <br></br>
    </>
  )
}

/** Connect with Valora (testnet wallet) using Wallet Connect */
async function connectWalletConnect(props: INavbarProps) {
  if (props.connected()) {
    props.setMessage(`Already connected: ${kit.defaultAccount}`)
    return
  }

  const provider = new WalletConnectProvider({
    rpc: {
      44787: 'https://alfajores-forno.celo-testnet.org',
      42220: 'https://forno.celo.org',
    },
  })

  await provider.enable()
  const web3 = new Web3(provider as any)
  try {
    _connect(props, web3)
  } catch (error) {
    props.setMessage(`⚠️ ${error}.`)
  }
}

/** Connect using the celo chrome extension wallet */
async function connectCeloWallet(props: INavbarProps) {
  if (props.connected()) {
    props.setMessage(`Already connected: ${kit.defaultAccount}`)
    return
  }

  if (window.celo) {
    props.setMessage('⚠️ Please approve this DApp to use it.')
    try {
      await window.celo.enable()
      const web3 = new Web3(window.celo)
      _connect(props, web3)
    } catch (error) {
      props.setMessage(`⚠️ ${error}.`)
    }
  } else {
    props.setMessage('⚠️ Please install the CeloExtensionWallet.')
  }
}

async function _connect(props: INavbarProps, web3: Web3) {
  kit = contractkit.newKitFromWeb3(web3)

  const accounts = await kit.web3.eth.getAccounts()
  kit.defaultAccount = accounts[0]

  managerContract = new kit.web3.eth.Contract(
    managerABI.abi as AbiItem[],
    constants.addresses.Manager,
  ) as unknown as Manager
  exampleTemplateContract = new kit.web3.eth.Contract(
    managerABI.abi as AbiItem[],
    constants.addresses.ExampleProjectTemplate,
  ) as unknown as ExampleProjectTemplate
  props.setConnected(true)
  props.setMessage(`Connected: ${kit.defaultAccount}`)
}

async function disconnect(props: INavbarProps) {
  const provider = kit.web3.eth.currentProvider
  if (provider instanceof WalletConnectProvider) {
    console.log('WalletConnectProvider')
    provider.disconnect()
  } else if (provider?.hasOwnProperty('disconnect')) {
    kit.connection.stop()
  }
  props.setConnected(false)
  props.setMessage('Disconnected')
}

async function getUserRole(props: INavbarProps): Promise<void> {
  if (!managerContract) return
  const role: string = await managerContract.methods.getRole().call()
  props.setMessage(role)
}

async function getBalance(props: INavbarProps) {
  if (!kit) {
    await connectCeloWallet(props)
  }

  if (!kit.defaultAccount) {
    props.setMessage('Please connect your wallet to check your balance')
    return
  }
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD?.shiftedBy(-constants.ERC20_DECIMALS).toFixed(2)
  props.setMessage(`Balance (cUSD): ${cUSDBalance}`)
}
