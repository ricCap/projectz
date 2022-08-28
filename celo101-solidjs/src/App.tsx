import type { Component } from 'solid-js';
import Comp from './Comp';

const App: Component = () => {
  return (
    <>
      <div class="bg-gray-100">
        <h1 class="flex-auto text-lg font-semibold text-slate-900">
          SolidJS + web3 (@celo/contractkit) example
        </h1>
        <p class="text-lg font-semibold text-slate-500">This app lets you connect the celo wallet extension and retrieve your balance</p>
        <Comp />
      </div>
    </>
  );
};

export default App;
