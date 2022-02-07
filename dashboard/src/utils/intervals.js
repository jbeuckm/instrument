import { ascend, prop } from 'ramda'

export const getSortedBoundaries = (a, b) => {
  const boundaries = []

  a.forEach(([from, to]) => {
    boundaries.push({ x: from, source: 'a', status: true })
    boundaries.push({ x: to, source: 'a', status: false })
  })
  b.forEach(([from, to]) => {
    boundaries.push({ x: from, source: 'b', status: true })
    boundaries.push({ x: to, source: 'b', status: false })
  })

  return boundaries.sort(ascend(prop('x')))
}

export const walkBoundaries = (boundaries, getStatus) => {
  let lastStatus = false
  const results = []
  let start

  const statuses = {
    a: false,
    b: false,
  }

  boundaries.forEach(({ x, source, status }) => {
    statuses[source] = status

    const newStatus = getStatus(statuses['a'], statuses['b'])

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

export const difference = (a, b) => {
  const boundaries = getSortedBoundaries(a, b)

  return walkBoundaries(boundaries, (statusA, statusB) => statusA && !statusB)
}

export const intersection = (a, b) => {
  const boundaries = getSortedBoundaries(a, b)

  return walkBoundaries(boundaries, (statusA, statusB) => statusA && statusB)
}

export const union = (a, b) => {
  const boundaries = getSortedBoundaries(a, b)

  return walkBoundaries(boundaries, (statusA, statusB) => statusA || statusB)
}
