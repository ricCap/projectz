import Web3 from 'web3'
import * as constants from '../constants'
import * as types from '../types'
import * as contractkit from '@celo/contractkit'

import WalletConnectProvider from '@walletconnect/web3-provider';

import { createSignal, createResource, Show, For } from "solid-js";
import BigNumber from "bignumber.js"

import marketplaceABI from '../../artifacts/contracts/Marketplace.sol/Marketplace.json'

export let kit: contractkit.ContractKit
export let contract: any // need to find a way to add types here


/** Simple message in the UI */
const [message, setMessage] = createSignal("Started");
const [connected, setConnected] = createSignal(false);
const [data, { mutate, refetch }] = createResource(connected, getProducts);


/** Global interface required to interact with window.celo */
declare global {
  interface Window {
    celo: any;
  }
}


/** Basic component with some buttons and a list of products */
export default function Comp() {
  return (<div>
    <h1 class="bg-sky-100 m100">Message: {message()}</h1>
    <button class="bg-black text-white font-bold py-2 px-4 rounded-full" onClick={() => connectCeloWallet()}>Connect with browser extension</button>
    <button class="bg-black text-white font-bold py-2 px-4 rounded-full" onClick={() => connectWalletConnect()}>Connect with wallet connect</button>
    <button class="bg-black text-white font-bold py-2 px-4 rounded-full" onClick={() => getBalance()}>Get balance</button>
    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => refetch()}>Get products</button>
    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => writeProduct()}>Write new product</button>
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={() => disconnect()}>Disconnect</button>

    <Show when={!data.loading} fallback={<>Searching...</>}>
      <ul>
        <For each={data()}>
          {(product: types.Product) => (
            <li>
              {product.name} by {product.owner}
            </li>
          )}
        </For>
      </ul>
    </Show>
  </div >
  )
}

/** Connect with Valora (testnet wallet) using Wallet Connect */
async function connectWalletConnect() {
  if (connected()) {
    setMessage(`Already connected: ${kit.defaultAccount}`)
    return
  }

  const provider = new WalletConnectProvider({
    rpc: {
      44787: "https://alfajores-forno.celo-testnet.org",
      42220: "https://forno.celo.org",
    },
  });

  await provider.enable()
  const web3 = new Web3(provider as any);
  try {
    _connect(web3)
  } catch (error) {
    setMessage(`⚠️ ${error}.`)
  }
}

/** Connect using the celo chrome extension wallet */
async function connectCeloWallet() {
  if (connected()) {
    setMessage(`Already connected: ${kit.defaultAccount}`)
    return
  }

  if (window.celo) {
    setMessage("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      const web3 = new Web3(window.celo)
      _connect(web3)
    } catch (error) {
      setMessage(`⚠️ ${error}.`)
    }
  } else {
    setMessage("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function _connect(web3: Web3) {
  kit = contractkit.newKitFromWeb3(web3)
  console.log(kit)

  const accounts = await kit.web3.eth.getAccounts()
  kit.defaultAccount = accounts[0]

  contract = new kit.web3.eth.Contract(marketplaceABI.abi, constants.MPContractAddress)
  console.log(contract)
  setConnected(true)
  setMessage(`Connected: ${kit.defaultAccount}`)
}

async function disconnect() {
  const provider = kit.web3.eth.currentProvider
  if (provider instanceof WalletConnectProvider) {
    console.log("WalletConnectProvider")
    provider.disconnect()
  } else if (provider?.hasOwnProperty("disconnect")) {
    kit.connection.stop();
  }
  setConnected(false)
  setMessage("Disconnected")
  mutate([])
}

async function getProducts(): Promise<types.Product[]> {
  if (!contract) {
    return []
  }
  const _productsLength = await contract.methods.getProductsLength().call()
  const _products: Promise<types.Product>[] = []
  for (let i = 0; i < _productsLength; i++) {
    const _product = async function (): Promise<types.Product> {
      let p = await contract.methods.readProduct(i).call()
      return {
        index: i,
        owner: p[0],
        name: p[1],
        image: p[2],
        description: p[3],
        location: p[4],
        price: new BigNumber(p[5]),
        sold: p[6],
      }
    }()
    _products.push(_product)
  }
  return await Promise.all(_products)
}


async function getBalance() {
  if (!kit) {
    await connectCeloWallet()
  }

  if (!kit.defaultAccount) {
    setMessage("Please connect your wallet to check your balance")
    return
  }
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD?.shiftedBy(-constants.ERC20_DECIMALS).toFixed(2)
  setMessage(`Balance (cUSD): ${cUSDBalance}`)
}

async function writeProduct() {
  await contract.methods.writeProduct(
    "New product",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png",
    "Description",
    "location",
    1
  ).send({ from: kit.defaultAccount })
}
