export async function handler(event, context) {
  const OMDB_API_KEY = process.env.OMDB_API_KEY
  const { title } = event.queryStringParameters

  try {
    const response = await fetch(`http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${title}`)

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch data from OMDB API' })
      }
    }

    const data = await response.json()
    console.log('Data from OMDB API:', data)

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  } catch (err) {
    console.error('Error fetching data:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    }
  }
}
