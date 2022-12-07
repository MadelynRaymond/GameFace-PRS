import { add } from './util'

test('adds two numbers', () => {
    expect(add(2, 2)).toBe(4)
})

test('vitest not', () => {
    expect(add(2, 2)).not.toBe(2)
})
