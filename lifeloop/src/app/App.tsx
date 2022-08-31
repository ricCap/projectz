import { Component, createSignal, createResource } from 'solid-js'
import Comp from './marketplace/Comp'
import Navbar from './Home'

import { getI18N } from './i18n'

/** Various signals that should be passed down to other components */
const connectedSignal = createSignal(false);
const [connected, setConnected] = connectedSignal
const [locale, setLocale] = createSignal(getI18N("en"))

const App: Component = () => {

  return (
    <div class="bg-blue-700">
      <div class="container mx-auto bg-white h-screen">
        <div class="flex flex-col h-screen">
          <Navbar connected={connectedSignal} locale={locale} setLocale={setLocale} />
          <main class="mb-auto">
            <h1 class="flex-auto text-lg text-center font-semibold text-slate-900">
              {locale().t("welcome")}
            </h1>
            <Comp connected={connected} setConnected={setConnected} />
            <div>
              Extra debug info:
              <p>Locale: {locale().locale()}</p>
            </div>
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

