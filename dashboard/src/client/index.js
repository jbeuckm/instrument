import forge from 'mappersmith'
import parse from 'csv-parse/lib/sync'

const ParseDattaMiddleware = () => ({
  response(next) {
    return next().then((response) =>
      parse(response.data(), {
        columns: true,
        cast: (value, { column }) => {
          switch (column) {
            case 'timestamp':
              return parseInt(value)
            case 'reading':
              return parseFloat(value)
            default:
              return value
          }
        },
      })
    )
  },
})

const client = new forge({
  clientId: 'readings',
  host: 'https://if2574leol.execute-api.us-east-2.amazonaws.com/dev',
  resources: {
    Readings: {
      list: {
        path: '/readings',
        headers: { 'x-api-key': 'esHC6lRZzJ2R2dnKXVI6157bY5wirAkh6uznnGaU' },
        middleware: [ParseDattaMiddleware],
      },
    },
  },
})

export default client
