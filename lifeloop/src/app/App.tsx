import { Component, createSignal, createResource } from 'solid-js'
import Comp from './marketplace/Comp'
import Navbar from './Home'

import { getI18N } from './i18n'

/** Various signals that should be passed down to other components */
const connectedSignal = createSignal(false);
const [connected, setConnected] = connectedSignal
const [locale, setLocale] = createSignal(getI18N("en"))

import url from './assets/infinity.svg'

const App: Component = () => {

  return (
    <div class="bg-black">
      <div class="container mx-auto bg-white h-screen">
        <div class="flex flex-col h-screen">
          <Navbar connected={connectedSignal} locale={locale} setLocale={setLocale} />
          <main class="mb-auto">
            <div class="flex flex-row justify-center items-center">
              <div class=""><img src={url} class="box-border h-32 w-32 ml-5" /></div>
              <div class="font-bold text-center text-5xl p-5">
                {locale().t("welcome")}
              </div>
              <div class=""><img src={url} class="box-border h-32 w-32 mr-5" /></div>
            </div>

            <Comp connected={connected} setConnected={setConnected} />
          </main>

          <footer class="p-4 bg-blue-700 shadow md:flex md:items-center md:justify-center">
            <span class="text-sm text-white sm:text-center">© 2022 <a href="https://google.com/" class="hover:underline">LifeLoop</a>. All Rights Reserved.
            </span>
          </footer>
        </div>

      </div>
    </div>
  );
};

export default App;

