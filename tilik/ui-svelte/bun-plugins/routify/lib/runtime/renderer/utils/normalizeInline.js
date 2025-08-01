import {
    backupScrollBehavior,
    getAllAncestors,
    restoreScrollBehavior,
} from '../../plugins/scroller/utils.js'

/**
 * normalize inline object. If no pages are specified, use siblings of the refNode
 * @param {InlineInput|null} inlineInput
 * @returns {Partial<Inline>}
 */
export const coerceInlineInputToObject = inlineInput => {
    if (typeof inlineInput === 'undefined') return {}

    return {
        // if inline is true, callback will return true
        isInline: () => !!inlineInput,

        // @ts-ignore
        ...inlineInput,
    }
}

export const defaultScrollIntoView = (elem, isInstant, options) => {
    const ancestors = getAllAncestors(elem)
    ancestors.forEach(backupScrollBehavior)

    if (isInstant) ancestors.forEach(ancestor => (ancestor.style.scrollBehavior = 'auto'))

    if (options.boundary) {
        return import('scroll-into-view-if-needed').then(r => {
            setTimeout(() => ancestors.forEach(restoreScrollBehavior), 0)
            return r.default(elem, {
                scrollMode: 'if-needed',
                ...options,
            })
        })
    }
    setTimeout(() => ancestors.forEach(restoreScrollBehavior), 0)

    return elem.scrollIntoView(options)
}

/**
 *
 * @param {Partial<Inline>} inlineInput
 * @returns {Inline}
 */
export const normalizeInline = inlineInput => ({
    isInline: () => false,

    scrollIntoView: defaultScrollIntoView,
    context: 'browser',
    params: {},
    ...inlineInput,
    wrapper: undefined,

    // If a function is passed, it will be used as the callback.
    // If undefined, the callback will return true if it's the last element in the array.
    // Otherwise, it will return true if inline is true.
    shouldScroll:
        typeof inlineInput.shouldScroll === 'function'
            ? inlineInput.shouldScroll
            : typeof inlineInput.shouldScroll === 'undefined'
            ? (ctx, index, arr, defaultCallback) => defaultCallback(ctx, index, arr)
            : () => !!inlineInput.shouldScroll,
})
