export async function handler(event, context) {
  const OMDB_API_KEY = process.env.OMDB_API_KEY
  const { title, id } = event.queryStringParameters

  try {
    let apiUrl
    if (id) {
      // Fetch detailed movie information using IMDb ID
      apiUrl = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}`
    } else if (title) {
      // Perform a general search using the title
      apiUrl = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${title}`
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Title or IMDb ID is required' })
      }
    }

    const response = await fetch(apiUrl)
    const data = await response.json()
    console.log('Data from OMDB API:', data)

    if (data.Response === 'False') {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: data.Error || 'Movie not found' })
      }
    }

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
