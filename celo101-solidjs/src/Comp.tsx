import Web3 from 'web3'
import * as constants from './constants'
import * as contractkit from '@celo/contractkit'
import marketplaceABI from '../artifacts/contracts/Marketplace.sol/Marketplace.json'

import { createSignal, createResource, Show, For } from "solid-js";
import BigNumber from "bignumber.js"
import * as types from './types'


export let kit: contractkit.ContractKit
export let contract: any



const [message, setMessage] = createSignal("Started");
const [connected, setConnected] = createSignal(false);
const [data] = createResource(connected, getProducts);


export default function Comp() {
  return (<div>
    <h1 class="bg-sky-100 m100">Message: {message()}</h1>
    <button class="px-6 font-semibold rounded-md bg-black text-white" onClick={getBalance}>
      Get balance
    </button>

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
  </div>
  )
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

  await contract.methods.writeProduct(
    "New product",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png",
    "Description",
    "location",
    1
  ).send({ from: kit.defaultAccount })

}


declare global {
  interface Window {
    celo: any;
  }
}

async function connectCeloWallet() {
  if (window.celo) {
    setMessage("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()

      const web3 = new Web3(window.celo)
      kit = contractkit.newKitFromWeb3(web3)
      console.log(kit)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceABI.abi, constants.MPContractAddress)
      console.log(contract)
      setConnected(true)
    } catch (error) {
      setMessage(`⚠️ ${error}.`)
    }
  } else {
    setMessage("⚠️ Please install the CeloExtensionWallet.")
  }
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
