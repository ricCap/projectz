import { Component, createSignal } from 'solid-js'
import { ConnectionProps } from '../App'

import url from '../assets/infinity.svg'

const InfoPanel: Component<ConnectionProps> = props => {
  type UserType = 'donor' | 'participant' | 'partner'
  const [user, setUser] = createSignal<UserType>('donor')

  return (
    <div>
      <div class="grid grid-1 bg-sky-100 border-b border-blue-100">
        <div class="flex flex-row justify-center items-center border-b border-blue-200">
          <div class="">
            <img src={url} class="box-border h-32 w-32 ml-5" />
          </div>
          <div class="font-bold text-center text-5xl p-5">{props.locale().t('welcome')}</div>
          <div class="">
            <img src={url} class="box-border h-32 w-32 mr-5" />
          </div>
        </div>
      </div>

      <div class="p-5 text-center">
        <p class="text-l">{props.locale().t(`info.${user()}.description`)}</p>

        <div class="inline-flex rounded-md shadow-sm m-4" role="group">
          <button
            type="button"
            class="py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-l-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            onClick={() => setUser('donor')}
          >
            {props.locale().t('info.donor.selector')}
          </button>
          <button
            type="button"
            class="py-2 px-4 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            onClick={() => setUser('partner')}
          >
            {props.locale().t('info.partner.selector')}
          </button>
          <button
            type="button"
            class="py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-r-md border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            onClick={() => setUser('participant')}
          >
            {props.locale().t('info.participant.selector')}
          </button>
        </div>

        <div class="m-4">{props.locale().t(`info.${user()}.details`)}</div>

        <div>
          <a href="#project-templates" class="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 m-4">
            {props.locale().t('info.to-projects')}
          </a>
        </div>

        <div class="m-4" hidden={!props.debugOn()}>
          {props.locale().t(`info.debug`)}
        </div>
      </div>
    </div>
  )
}

export default InfoPanel
