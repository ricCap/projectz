# LifeLoop

You can see a preview of the application at [https://riccap.github.io/projectz/](https://riccap.github.io/projectz/).

## Documentation

Please refer to the [wiki](https://github.com/ricCap/projectz/wiki) of this repository for a full breakdown of the project business model and contracts architecture.

## Resources

The application is developed using:

- [solidjs](https://www.solidjs.com/)
- [tailwindcss](https://tailwindcss.com/)
- [hardhat](https://hardhat.org/)
- [vitejs](https://vitejs.dev/)

The charts in the wiki use the [Mermaid syntax](https://mermaid-js.github.io/mermaid/)

## Development

Start by installing the dependencies using `npm install`; the task will install the required dependencies and run a postinstall task that will compile and generate types for your contracts. For a full list of tasks please refer to the `package.json` file.

To start a local development server with vite run `npm run dev`.

The task `npm run deploy` (and any other task that requires interacting with the Alfajores testnet) requires you to create a `.env` file with a mnemomic key of your testnet account in the project root folder (see `.env-template` for an example). When running `npm run deploy`, the file `src/addresses.json` will be updated with the addresses of the newly-deployed contracts.

You can ensure to run all mandatory tasks included in the ci (i.e., `npm run all`) by adding the git hooks with `git config --local core.hooksPath .githooks/`.

To run hardhat test you can run `npm run test`. You can also run the tests again testnet by running `npm run test:testnet` (this will run against the Alfajores testnet, make sure to have the .env file correctly configured.)

Typechains are build for:

- `ethers.js` in the `typechain-types` folder (used for hardhat tests)
- `web3` in `src/types` for the webapp

### Automation

The project contains various linters and formatters, such as `eslint`, `sollint` and `prettier`. Tasks for these tools are defined in the `package.json` file. The workflows in `.github/workflows` run static code analysis and the `npm run all` task.

## Template

https://github.com/paulrberg/hardhat-template
