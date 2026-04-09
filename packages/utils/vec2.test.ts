import { expect, test } from 'vitest'
import Vec2 from './vec2'

test('initialize a Vec2', () => {
    const vec2 = new Vec2()
    expect(vec2.x).toBeDefined()
})

test('add', () => {
    const vec2 = new Vec2(5, 6)
    const other = new Vec2(-3, 8)
    vec2.add(other)
    expect(vec2.x).toBe(2)
    expect(vec2.y).toBe(14)

    vec2.add(3)
    expect(vec2.x).toBe(5)
    expect(vec2.y).toBe(17)

    vec2.add(5, -2)
    expect(vec2.x).toBe(10)
    expect(vec2.y).toBe(15)
})

test('subtract', () => {
    const vec2 = new Vec2(-2, -2)
    const other = new Vec2(1, -5)
    vec2.sub(other)
    expect(vec2.x).toBe(-3)
    expect(vec2.y).toBe(3)

    vec2.sub(1)
    expect(vec2.x).toBe(-4)
    expect(vec2.y).toBe(2)

    vec2.sub(2, -3)
    expect(vec2.x).toBe(-6)
    expect(vec2.y).toBe(5)
})

test('mult', () => {
    const vec2 = new Vec2(2, -2)
    const other = new Vec2(3, -0.5)

    vec2.mult(other)
    expect(vec2.x).toBe(6)
    expect(vec2.y).toBe(1)

    vec2.mult(2)
    expect(vec2.x).toBe(12)
    expect(vec2.y).toBe(2)

    vec2.mult(0.5, 3)
    expect(vec2.x).toBe(6)
    expect(vec2.y).toBe(6)
})

test('div', () => {
    const vec2 = new Vec2(-8, 5)
    const other = new Vec2(4, 2)
    vec2.div(other)
    expect(vec2.x).toBe(-2)
    expect(vec2.y).toBe(2.5)

    vec2.div(2)
    expect(vec2.x).toBe(-1)
    expect(vec2.y).toBe(1.25)

    vec2.div(0.5, 2.5)
    expect(vec2.x).toBe(-2)
    expect(vec2.y).toBe(0.5)
})

test('magnitude', () => {
    const vec2 = new Vec2(-8, 6)
    expect(vec2.mag()).toBe(10)
    expect(vec2.magSq()).toBe(100)
})

test('normalize', () => {
    const vec2 = new Vec2(3, 5)
    expect(vec2.normalize().mag()).toBeCloseTo(1, 6)
})

test('limit', () => {
    const vec2 = new Vec2(8, 6)
    vec2.limit(5)
    expect(vec2.mag()).toBe(5)
})

test('copy', () => {
    const vec2 = new Vec2(3, 4)
    const copy = vec2.copy()
    expect(copy.x).toBe(3)
    expect(copy.y).toBe(4)
    copy.x = 10
    expect(vec2.x).toBe(3)
    expect(vec2.y).toBe(4)
})

test('setMag', () => {
    const vec2 = new Vec2(3, 4)
    vec2.setMag(10)
    expect(vec2.mag()).toBe(10)
})

test('distance', () => {
    const vec2 = new Vec2(3, 4)
    const other = new Vec2(6, 8)
    expect(vec2.distance(other)).toBe(5)
})
