import Polyglot from 'node-polyglot'
import { Component, createSignal, createResource, Accessor, Setter, mergeProps } from 'solid-js'

import Navbar from './Navbar'
import { getI18N } from './i18n/i18n'
import InfoPanel from './infoPanel/InfoPanel'
import DebugBox from './DebugBox'
import { TemplatesTable } from './projects/ProjectTemplate'

export interface ConnectionProps {
  message: Accessor<string>
  setMessage: Setter<string>
  connected: Accessor<boolean>
  setConnected: Setter<boolean>
  locale: Accessor<Polyglot>
  setLocale: Setter<Polyglot>
  debugOn: Accessor<boolean>
  setDebugOn: Setter<boolean>
}

const Footer = () => {
  return (
    <footer class="p-4 bg-blue-700 text-white shadow flex items-center justify-center">
      <span class="text-sm text-center">
        © 2022{' '}
        <a href="https://google.com/" class="hover:underline">
          LifeLooop
        </a>
        . All Rights Reserved.
      </span>
    </footer>
  )
}

const App: Component = () => {
  const [message, setMessage] = createSignal('Started')
  const [connected, setConnected] = createSignal(false)
  const [locale, setLocale] = createSignal(getI18N('en'))
  const [debugOn, setDebugOn] = createSignal(false)

  const props: ConnectionProps = {
    connected: connected,
    setConnected: setConnected,
    locale: locale,
    setLocale: setLocale,
    message: message,
    setMessage: setMessage,
    debugOn: debugOn,
    setDebugOn: setDebugOn,
  }

  return (
    <div class="flex bg-black min-h-screen">
      <div class="container mx-auto bg-white">
        <div class="flex flex-col min-h-screen">
          <Navbar {...mergeProps(props)} />
          <main class="mb-auto">
            <InfoPanel {...mergeProps(props)}></InfoPanel>
            <DebugBox {...mergeProps(props)}></DebugBox>
            <a id="project-templates" />
            <TemplatesTable {...mergeProps(props)}></TemplatesTable>
          </main>
          <Footer></Footer>
        </div>
      </div>
    </div>
  )
}

export default App
