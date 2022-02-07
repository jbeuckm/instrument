import { ascend, prop } from 'ramda'

export const difference = (a, b) => {
  const boundaries = [
    { x: a[0], source: 'minuend', status: true },
    { x: a[1], source: 'minuend', status: false },
    { x: b[0], source: 'subtrahend', status: true },
    { x: b[1], source: 'subtrahend', status: false },
  ]

  const sorted = boundaries.sort(ascend(prop('x')))

  const results = []
  let start

  const statuses = {
    minuend: false,
    subtrahend: false,
  }
  let lastStatus = false

  sorted.forEach(({ x, source, status }) => {
    statuses[source] = status

    const newStatus = statuses['minuend'] && !statuses['subtrahend']

    if (lastStatus !== newStatus) {
      if (newStatus) {
        start = x
      } else {
        results.push([start, x])
      }
      lastStatus = newStatus
    }
  })

  return results
}
