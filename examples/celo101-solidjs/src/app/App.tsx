import { Component, createSignal } from 'solid-js'
import Comp from './marketplace/Comp'
import Navbar from './Home'

const connectedSignal = createSignal(false);
const [connected, setConnected] = connectedSignal

const App: Component = () => {
  return (
    <div class="bg-blue-700">
      <div class="container mx-auto bg-white h-screen">
        <div class="flex flex-col h-screen">
          <Navbar connected={connectedSignal} />

          <main class="mb-auto">
            <h1 class="flex-auto text-lg font-semibold text-slate-900">
              SolidJS + web3 (@celo/contractkit) example
            </h1>
            <p class="text-lg font-semibold text-slate-500">This app lets you connect the celo wallet extension and retrieve your balance</p>
            <Comp connected={connected} setConnected={setConnected} />
          </main>


          <footer class="p-4 bg-white shadow md:flex md:items-center md:justify-center">
            <span class="text-sm text-gray-500 sm:text-center">© 2022 <a href="https://google.com/" class="hover:underline">LifeLoop</a>. All Rights Reserved.
            </span>
          </footer>
        </div>

      </div>
    </div>
  );
};

export default App;
