import { Accessor, JSXElement, Show, Signal } from 'solid-js';

interface IHomeProps {
    connected: Signal<boolean>
}

export default function Navbar(props: IHomeProps): JSXElement {
    return (
        <>
            <div class="container w-full flex flex-row bg-grey-100">
                <Show
                    when={props.connected[0]()}
                    fallback={
                        <>
                            <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 content-end" >Connect</button>
                        </>
                    }>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 content-end" disabled >Disconnect</button>
                </Show>
            </div>
            <br></br>
        </>
    )
}
