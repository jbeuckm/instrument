import { difference, union } from './intervals'

describe('intervals', () => {
  describe('difference', () => {
    test('contained', () => {
      const result = difference([0, 5], [1, 2])

      expect(result).toEqual([
        [0, 1],
        [2, 5],
      ])
    })
    test('contains', () => {
      const result = difference([1, 2], [0, 5])

      expect(result).toEqual([])
    })
    test('before start', () => {
      const result = difference([0, 5], [-2, -1])

      expect(result).toEqual([[0, 5]])
    })
    test('across start', () => {
      const result = difference([0, 5], [-1, 2])

      expect(result).toEqual([[2, 5]])
    })
    test('across end', () => {
      const result = difference([0, 5], [2, 8])

      expect(result).toEqual([[0, 2]])
    })
    test('after end', () => {
      const result = difference([0, 5], [7, 8])

      expect(result).toEqual([[0, 5]])
    })

    test('subtract point', () => {
      const result = difference([0, 5], [2, 2])

      expect(result).toEqual([
        [0, 2],
        [2, 5],
      ])
    })
    test('from point', () => {
      const result = difference([2, 2], [0, 5])

      expect(result).toEqual([])
    })
  })

  xtest('union', () => {
    const result = union([0, 1], [3, 4])

    expect(result).toEqual([
      [0, 1],
      [3, 4],
    ])
  })
})