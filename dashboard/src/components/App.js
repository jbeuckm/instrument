import { useEffect, useState, useCallback } from 'react'
import { VictoryChart, VictoryAxis, VictoryLine, VictoryArea, createContainer } from 'victory'
import Annotations from './Annotations'
import { ascend, groupBy, prop } from 'ramda'
import SunCalc from 'suncalc'
import client from '../client'

import { difference, union } from '../utils/intervals'

const colors = ['#9e6864', '#3f0f63', '#35868c', '#f24b3f', '#6d9c49']

const SelectDataContainer = createContainer('zoom', 'voronoi')

const DAY = 24 * 3600 * 1000
const START_DATE = new Date('1/26/2021')

const now = new Date()

const App = () => {
  const [series, setSeries] = useState()
  const [annotations, setAnnotations] = useState([])
  const [voronoiData, setVoronoiData] = useState()

  const [seriesColor, setSeriesColor] = useState({})

  const [fetchedIntervals, setFetchedIntervals] = useState([])

  const fetchInterval = (from, to) => {
    if (!from || !to) {
      return
    }
    const gaps = difference([[from, to]], fetchedIntervals)

    const gap = gaps[0]
    if (!gap) {
      return
    }

    client.Readings.list({ from: gap[0], to: gap[1] })
      .then((records) => {
        const newSeries = groupBy(prop('source'))(records)

        const newColors = { ...seriesColor }

        Object.keys(newSeries).forEach((seriesId, index) => {
          if (!seriesColor[seriesId]) {
            newColors[seriesId] = colors[index % colors.length]
          }
        })
        setSeriesColor(newColors)

        if (series)
          Object.keys(series).forEach((key) => {
            if (newSeries[key]) {
              newSeries[key] = newSeries[key].concat(series[key]).sort(ascend(prop('timestamp')))
            } else {
              newSeries[key] = series[key]
            }
          })

        setSeries(newSeries)
        setFetchedIntervals(union(fetchedIntervals, [gap]))
      })
      .catch((error) => console.error(error))
  }

  const initialInterval = [now.valueOf() - 3 * DAY, now.valueOf()]

  useEffect(() => {
    fetchInterval(initialInterval[0], initialInterval[1])
  }, [])

  const handleDomainChanged = (domain) => {
    // setZoomDomainX(domain.x)

    fetchInterval(domain.x[0].valueOf(), domain.x[1].valueOf())
  }

  const handleClickLegend = useCallback((key) => {
    console.log(key)
  }, [])

  const clickChart = useCallback(() => {
    console.log(setAnnotations(voronoiData))
  }, [voronoiData])

  return (
    <div className="App">
      {series &&
        Object.keys(series).map((key) => (
          <span onClick={() => handleClickLegend(key)} style={{ padding: 5 }}>
            <span
              style={{
                backgroundColor: seriesColor[key],
                display: 'inline-block',
                width: 20,
                height: 20,
              }}
            ></span>{' '}
            {key}
          </span>
        ))}

      <VictoryChart
        padding={25}
        height={window.innerHeight - 100}
        width={window.innerWidth}
        scale={{ x: 'time' }}
        minDomain={{ x: START_DATE, y: -30 }}
        maxDomain={{ x: now, y: 55 }}
        containerComponent={
          <SelectDataContainer
            zoomDimension="x"
            zoomDomain={{ x: initialInterval }}
            responsive={false}
            onZoomDomainChange={handleDomainChanged}
            allowPan={true}
            allowZoom={true}
            labels={({ datum }) => {
              // console.log(datum)
              return datum.reading || datum.y
            }}
            onActivated={(points) => setVoronoiData(points)}
            events={{ onClick: clickChart }}
          />
        }
      >
        <VictoryArea
          samples={500}
          style={{ data: { fill: '#ffee99' } }}
          y={(data) => {
            return Math.max(
              0,
              (SunCalc.getPosition(data.x, 45.060879, -93.2219807).altitude * 180) / Math.PI
            )
          }}
        />

        <VictoryArea
          samples={500}
          style={{ data: { fill: '#78c' } }}
          y={(data) => {
            return Math.min(
              0,
              (SunCalc.getPosition(data.x, 45.060879, -93.2219807).altitude * 180) / Math.PI
            )
          }}
        />

        {series &&
          Object.keys(series).map((key) => {
            const item = series[key]
            return (
              <VictoryLine
                key={key}
                name={key}
                style={{
                  data: {
                    strokeWidth: 1,
                    stroke: seriesColor[key],
                  },
                  parent: { border: `1px solid #666` },
                }}
                data={item}
                x={'timestamp'}
                y={'reading'}
              />
            )
          })}

        <VictoryAxis
          style={{
            grid: { stroke: '#818e99', strokeWidth: 0.5 },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            grid: { stroke: '#818e99', strokeWidth: 0.5 },
          }}
        />

        <Annotations annotations={annotations} />
      </VictoryChart>
    </div>
  )
}

export default App
