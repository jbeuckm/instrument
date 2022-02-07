import { ascend, prop } from 'ramda'

export const difference = (a, b) => {
  const boundaries = [
    { x: a[0], source: 'a', position: 'left' },
    { x: a[1], source: 'a', position: 'right' },
    { x: b[0], source: 'b', position: 'left' },
    { x: b[1], source: 'b', position: 'right' },
  ]

  const sorted = boundaries.sort(ascend(prop('x')))

  const results = []
  let status = false

  let start
  let minuend = 0
  let subtrahend = 0

  sorted.forEach(({ x, source, position }) => {
    if (source === 'a') {
      if (position === 'left') {
        minuend = 1
      }
      if (position === 'right') {
        minuend = 0
      }
    }
    if (source === 'b') {
      if (position === 'left') {
        subtrahend = 1
      }
      if (position === 'right') {
        subtrahend = 0
      }
    }

    const newStatus = minuend === 1 && subtrahend === 0

    if (status !== newStatus) {
      if (newStatus) {
        start = x
      } else {
        results.push([start, x])
        start = undefined
      }
      status = newStatus
    }
  })

  return results
}
