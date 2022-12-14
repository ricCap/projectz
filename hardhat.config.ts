import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-web3'
import 'hardhat-gas-reporter'
import 'hardhat-contract-sizer'

import * as dotenv from 'dotenv'
dotenv.config()

const config: HardhatUserConfig = {
  networks: {
    alfajores: {
      url: 'https://alfajores-forno.celo-testnet.org',
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/52752'/0'/0",
      },
    },
    ganache: {
      chainId: 31337,
      url: 'http://127.0.0.1:8545',
      gas: 10000000,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/52752'/0'/0",
      },
    },
  },
  solidity: '0.8.17',
  typechain: {
    outDir: 'src/types',
    target: 'web3-v1',
    alwaysGenerateOverloads: false,
    externalArtifacts: ['externalArtifacts/*.json'],
    dontOverrideCompile: false,
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 1,
    enabled: true,
    outputFile: 'test/gas.txt',
    noColors: true,
  },
}

export default config
