import { useEffect, useState, useCallback } from 'react'
import { VictoryChart, VictoryAxis, VictoryLine, VictoryArea, createContainer } from 'victory'
import Annotations from './Annotations'
import { groupBy, mapObjIndexed, prop } from 'ramda'
import SunCalc from 'suncalc'
import client from '../client'
import debounce from 'lodash.debounce'

const colors = ['#9e6864', '#3f0f63', '#35868c', '#f24b3f', '#6d9c49']

const SelectDataContainer = createContainer('zoom', 'voronoi')

const DAY = 24 * 3600 * 1000
const START_DATE = new Date('1/26/2021')

const App = () => {
  const [series, setSeries] = useState()
  const [annotations, setAnnotations] = useState([])
  const [voronoiData, setVoronoiData] = useState()
  const [now, setNow] = useState(new Date())
  const [zoomDomainX, setZoomDomainX] = useState([now.valueOf])

  // const now = new Date()

  const updateData = debounce(
    (from, to) => {
      client.Readings.list({ from, to }).then((records) => {
        const groups = groupBy(prop('source'))(records)
        let i = 0
        const seriesFromArray = (data) => ({ data, color: colors[i++ % colors.length] })
        const newSeries = mapObjIndexed(seriesFromArray)(groups)
        setSeries(newSeries)
      })
    },
    500,
    { trailing: true }
  )

  useEffect(() => {
    updateData()

    setInterval(updateData, 5 * 60 * 1000)
  }, [])

  const handleDomainChanged = useCallback(
    (domain) => {
      setZoomDomainX(domain.x)

      updateData(domain.x[0].valueOf(), domain.x[1].valueOf())
    },
    [updateData]
  )

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
                backgroundColor: series[key].color,
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
            zoomDomain={{ x: [now.valueOf() - 3 * DAY, now.valueOf()] }}
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
                    stroke: item.color,
                  },
                  parent: { border: `1px solid #666` },
                }}
                data={item.data}
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
