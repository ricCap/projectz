import Polyglot from 'node-polyglot';
import { Accessor, JSXElement, Setter, Show, Signal } from 'solid-js';
import { getI18N } from './i18n';

interface IHomeProps {
    connected: Signal<boolean>
    locale: Accessor<Polyglot>
    setLocale: Setter<Polyglot>
}

export default function Navbar(props: IHomeProps): JSXElement {
    return (
        <>
            <div class="container w-full flex flex-row bg-blue-700">
                <div class="grow"></div>
                <Show
                    when={props.connected[0]()}
                    fallback={
                        <>
                            <button type="button" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 content-end cursor-not-allowed" disabled >{props.locale().t("navbar.button-connect")}</button>
                        </>
                    }>
                    <button type="button" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 content-end cursor-not-allowed" disabled >{props.locale().t("navbar.button-disconnect")}</button>
                </Show>
                <Show
                    when={props.locale().locale() === 'en'}
                    fallback={
                        <>
                            <button type="button"
                                class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 content-end"
                                onClick={() => props.setLocale(getI18N("en"))}>{props.locale().t("navbar.button-switch-language")}</button>
                        </>
                    }>
                    <button type="button"
                        class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 content-end"
                        onClick={() => props.setLocale(getI18N("it"))}>{props.locale().t("navbar.button-switch-language")}</button>
                </Show>
            </div>
            <br></br>
        </>
    )
}
