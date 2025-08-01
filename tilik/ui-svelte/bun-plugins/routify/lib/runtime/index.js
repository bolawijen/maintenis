// @ts-ignore
import Router from './Router/Router.svelte'
import { createRouter, Router as RouterClass } from './Router/Router.js'
import { RoutifyRuntime } from './Instance/RoutifyRuntime.js'

import { appInstance } from './Global/Global.js'
import { AddressReflector } from './Router/urlReflectors/Address.js'
import { LocalStorageReflector } from './Router/urlReflectors/LocalStorage.js'
import { InternalReflector } from './Router/urlReflectors/Internal.js'
import Component from './renderer/ComposeFragments.svelte'

// ROUTIFY-DEV-ONLY-START
// we only need to kill warnings in dev as they don't exist in prod
import { killWarnings } from './utils/killWarnings.js'
killWarnings()
// ROUTIFY-DEV-ONLY-END

export const Routify = RoutifyRuntime

export {
    createRouter,
    Router,
    RouterClass,
    appInstance,
    AddressReflector,
    LocalStorageReflector,
    InternalReflector,
    Component,
}

export * from './helpers/index.js'
export * from '../common/helpers.js'
