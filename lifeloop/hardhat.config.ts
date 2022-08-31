import { HardhatUserConfig } from "hardhat/config";
import * as toolbox from "@nomicfoundation/hardhat-toolbox";

import * as dotenv from 'dotenv'
dotenv.config()

const config: HardhatUserConfig = {
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/52752'/0'/0"
      },
    }
  },
  solidity: "0.8.9",
};

export default config;
