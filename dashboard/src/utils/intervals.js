import { ascend, prop } from 'ramda'

export const difference = (a, b) => {
  const boundaries = []

  a.forEach(([from, to]) => {
    boundaries.push({ x: from, source: 'minuend', status: true })
    boundaries.push({ x: to, source: 'minuend', status: false })
  })
  b.forEach(([from, to]) => {
    boundaries.push({ x: from, source: 'subtrahend', status: true })
    boundaries.push({ x: to, source: 'subtrahend', status: false })
  })

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
