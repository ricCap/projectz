import { Component, createSignal, createResource, Accessor, Setter } from 'solid-js'
import Navbar from './Navbar'

import { getI18N } from './i18n/i18n'
import url from './assets/infinity.svg'
import DebugBox from './DebugBox'
import { TemplatesTable } from './projects/ProjectTemplate'
import Polyglot from 'node-polyglot'

/** Various signals that should be passed down to other components */
const [message, setMessage] = createSignal('Started')
const [connected, setConnected] = createSignal(false)
const [locale, setLocale] = createSignal(getI18N('en'))

export interface ConnectionProps {
  message: Accessor<string>
  setMessage: Setter<string>
  connected: Accessor<boolean>
  setConnected: Setter<boolean>
  locale: Accessor<Polyglot>
  setLocale: Setter<Polyglot>
}

const Title = () => {
  return (
    <div class="grid grid-1 bg-sky-100 border-b border-blue-100">
      <div class="flex flex-row justify-center items-center border-b border-blue-200">
        <div class="">
          <img src={url} class="box-border h-32 w-32 ml-5" />
        </div>
        <div class="font-bold text-center text-5xl p-5">{locale().t('welcome')}</div>
        <div class="">
          <img src={url} class="box-border h-32 w-32 mr-5" />
        </div>
      </div>

      <div class="p-5 text-center">
        <p class="text-l">{locale().t('info')}</p>
      </div>
    </div>
  )
}

const Footer = () => {
  return (
    <footer class="p-4 bg-blue-700 text-white shadow flex items-center justify-center">
      <span class="text-sm text-center">
        © 2022{' '}
        <a href="https://google.com/" class="hover:underline">
          LifeLoop
        </a>
        . All Rights Reserved.
      </span>
    </footer>
  )
}

const App: Component = () => {
  return (
    <div class="bg-black">
      <div class="container mx-auto bg-white">
        <div class="flex flex-col h-screen">
          <Navbar
            connected={connected}
            setConnected={setConnected}
            locale={locale}
            setLocale={setLocale}
            message={message}
            setMessage={setMessage}
          />
          <main class="mb-auto">
            <Title></Title>
            <DebugBox
              connected={connected}
              setConnected={setConnected}
              message={message}
              setMessage={setMessage}
            ></DebugBox>
            <TemplatesTable
              message={message}
              setMessage={setMessage}
              connected={connected}
              setConnected={setConnected}
              locale={locale}
              setLocale={setLocale}
            ></TemplatesTable>
          </main>
          <Footer></Footer>
        </div>
      </div>
    </div>
  )
}

export default App
