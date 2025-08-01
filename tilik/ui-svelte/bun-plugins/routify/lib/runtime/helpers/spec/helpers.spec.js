import { mockRoutes } from '../../../common/utils.js'
import { RoutifyRuntime } from '../../../runtime/Instance/RoutifyRuntime.js'
import { traverseNode, getPath, getMRCA } from '../index.js'

const instance = new RoutifyRuntime({})
instance.rootNodes.default = mockRoutes(instance, {
    module: {
        index: {},
        about: {},
        posts: { '[slug]': {} },
        admin: {
            index: {},
            crud: { index: {} },
            users: { index: {} },
        },
    },
})

const mockRouter = { rootNode: instance.rootNodes.default }

const moduleNode = Object.values(instance.rootNodes)[0]
const slugNode = instance.nodeIndex.find(node => node.name === '[slug]')
const crudNode = instance.nodeIndex.find(node => node.name === 'crud')
const adminNode = instance.nodeIndex.find(node => node.name === 'admin')

test('can resolve parent', () => {
    const parentIndex = traverseNode(crudNode, '..', mockRouter)
    expect(parentIndex.name).toBe('admin')
})

test('can resolve grandparent', () => {
    const grandparentIndex = traverseNode(crudNode, '../..', mockRouter)
    expect(grandparentIndex.name).toBe('module')
})

test('can resolve sibling', () => {
    const siblingIndex = traverseNode(crudNode, '../users', mockRouter)
    expect(siblingIndex.name).toBe('users')
})

test('can resolve absolute', () => {
    const res = traverseNode(crudNode, '/about', mockRouter)
    expect(res.name).toBe('about')
})

test('can resolve named', () => {
    const res = traverseNode(crudNode, 'admin', mockRouter)
    expect(res.name).toBe('admin')
})

test("can resolve sibling's child", () => {
    const res1 = traverseNode(adminNode, '../posts/[slug]', mockRouter)
    expect(res1.name).toBe('[slug]')
})

test('can find mrca', () => {
    const mrcaNode = getMRCA(slugNode, crudNode).mrca
    expect(mrcaNode).toBe(moduleNode)
})

test('can find self as mrca', () => {
    const mrcaNode = getMRCA(crudNode, adminNode).mrca
    expect(mrcaNode).toBe(adminNode)
})

test('can find self as mrca reversed', () => {
    const mrcaNode = getMRCA(adminNode, crudNode).mrca
    expect(mrcaNode).toBe(adminNode)
})

test('can get path backwards', () => {
    const path = '../'
    const _path = getPath(crudNode, adminNode)
    expect(_path).toBe(path)
})

test('can get path forward', () => {
    const path = 'crud'
    const _path = getPath(adminNode, crudNode)
    expect(_path).toBe(path)
})

test('can get path back and forward', () => {
    const path = '../../admin/crud'
    const _path = getPath(slugNode, crudNode)
    expect(_path).toBe(path)
})

test('traverseNode can be reversed with getPath', () => {
    const path = getPath(slugNode, crudNode)
    expect(path).toBe('../../admin/crud')
    expect(traverseNode(slugNode, path, null)).toBe(crudNode)
})

// test('isActive detects active routes', () => {
//     // simulate browser url of /path/123
//     const isActive = isActiveContext('/path/123', { slug: '123' })

//     test('should match exact url', () =>
//         expect(isActive('/path/123/index', {}, { recursive: false })).toBeTruthy())

//     test('should match recursively by default', () =>
//         expect(isActive('/path/index', {})).toBeTruthy())

//     test('recursive matching should be optional', () =>
//         expect(isActive('/path/index', {}, { recursive: false })).toBeFalsy())

//     test('unspecified param should match all params', () =>
//         expect(isActive('/path/[slug]', {})).toBeTruthy())

//     test('specified params should match correct url', () =>
//         expect(isActive('/path/[slug]', { slug: '123' })).toBeTruthy())

//     test('specified params should not match incorrect url', () =>
//         expect(isActive('/path/[slug]', { slug: 'abc' })).toBeFalsy())

//     test('should handle explicit index', () => {
//         const isActive = isActiveContext('/path/index')

//         test('should match exact url', () =>
//             expect(isActive('/path/index', {}, { recursive: false })).toBeTruthy())

//         test('should match url with recursive mode', () =>
//             expect(isActive('/path/index', {})).toBeTruthy())

//         test('should not match inactive url', () =>
//             expect(isActive('/path/badpath', {})).toBeFalsy())
//     })

//     test('should handle queries', () => {
//         const isActive = isActiveContext('/post?id=123', { id: '123' })

//         test('should match path with matching params', () =>
//             expect(isActive('/post', { id: '123' })).toBeTruthy())

//         test('should not match path with mismatching params', () =>
//             expect(isActive('/post', { id: '456' })).toBeFalsy())
//     })

//     test('should handle empty pathname', () => {
//         const isActive = isActiveContext('')
//         expect(isActive('/index')).toBeTruthy()
//     })
// })
