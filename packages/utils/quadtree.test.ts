import { expect, test } from 'vitest'
import { QuadTree } from './quadTree'

test('initialize QuadTree', () => {
    const qt = new QuadTree([0, 0, 800, 800])
    expect(qt).toBeDefined()
})

const insertRandomPoint = (qt: QuadTree) => {
    qt.insert([Math.random() * qt.bounds.w, Math.random() * qt.bounds.h])
}

const getNodes = (qt: QuadTree) => {
    let stack: QuadTree[] = []
    let res: QuadTree[] = []
    let current: QuadTree | undefined = qt

    while (current) {
        res.push(current)
        stack.push(...current.children)
        current = stack.pop()
    }

    return res
}

test('move items to children when exceeds capacity', () => {
    const qt = new QuadTree([0, 0, 800, 800], 3)

    for (let i = 0; i < 5; i++) {
        insertRandomPoint(qt)
    }

    expect(qt.points.length).toBe(0)
    expect(qt.children.length).toBeGreaterThan(0)
})

test('all the items should be at the leaf nodes', () => {
    const qt = new QuadTree([0, 0, 800, 800], 4)

    for (let i = 0; i < 20; i++) {
        insertRandomPoint(qt)
    }

    const leafNodes = qt.getLeafNodes()
    expect(leafNodes.reduce((count, curNode) => count + curNode.points.length, 0)).toBe(20)
})
