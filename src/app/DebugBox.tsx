import { Accessor, Setter } from 'solid-js'
interface IDebugBoxProps {
  connected: Accessor<boolean>
  setConnected: Setter<boolean>
  message: Accessor<string>
  setMessage: Setter<string>
}

export default function DebugBox(props: IDebugBoxProps) {
  return (
    <div class="mt-5">
      <div class="bg-sky-100 m100 my-5 p-5 text-center">
        DebugBox:
        <h1 class="font-bold">{props.message()}</h1>
      </div>
    </div>
  )
}
