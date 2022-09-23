import { Accessor, Setter } from 'solid-js'
interface IDebugBoxProps {
  connected: Accessor<boolean>
  setConnected: Setter<boolean>
  message: Accessor<string>
  setMessage: Setter<string>
}

export default function DebugBox(props: IDebugBoxProps) {
  return (
    <div class="bg-indigo-900 text-center py-4 lg:px-4">
      <div
        class="p-2 bg-indigo-800 items-center text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex"
        role="alert"
      >
        <span class="flex rounded-full bg-indigo-500 uppercase px-2 py-1 text-xs font-bold mr-3">Debug</span>
        <span class="font-semibold mr-2 text-left flex-auto">{props.message()}</span>
      </div>
    </div>
  )
}
