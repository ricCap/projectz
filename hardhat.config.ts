import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-web3'

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
  },
  solidity: '0.8.9',
  typechain: {
    outDir: 'src/types',
    target: 'web3-v1',
    alwaysGenerateOverloads: false,
    externalArtifacts: ['externalArtifacts/*.json'],
    dontOverrideCompile: false,
  },
}

export default config
