import { Component, createSignal, createResource } from 'solid-js'
import Navbar from './Navbar'

import { getI18N } from './i18n'
import url from './assets/infinity.svg'
import DebugBox from './DebugBox'

/** Various signals that should be passed down to other components */
const [message, setMessage] = createSignal('Started')
const [connected, setConnected] = createSignal(false)
const [locale, setLocale] = createSignal(getI18N('en'))

const Title = () => {
  return (
    <div class="flex flex-row justify-center items-center">
      <div class="">
        <img src={url} class="box-border h-32 w-32 ml-5" />
      </div>
      <div class="font-bold text-center text-5xl p-5">{locale().t('welcome')}</div>
      <div class="">
        <img src={url} class="box-border h-32 w-32 mr-5" />
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
      <div class="container mx-auto bg-white h-screen">
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
          </main>
          <Footer></Footer>
        </div>
      </div>
    </div>
  )
}

export default App
