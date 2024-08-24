import axios from 'axios'
import Fuse from 'fuse.js'

const API_KEY = 'd9828266'
const BASE_URL = 'https://www.omdbapi.com/'

// fetch data from OMDB api...
const fetchFromApi = async (params) => {
  try {
    const response = await axios.get(BASE_URL, { params: { apikey: API_KEY, ...params } })
    if (response.data.Response === 'False') {
      throw new Error(response.data.Error)
    }
    return response.data
  } catch (error) {
    console.error('API error:', error.message || error)
    throw error
  }
}

// fetch movie details...
export const fetchMoviesAndDetails = async (query) => {
  // Fetch search results
  const searchResults = await fetchFromApi({ s: query })
  
  // Fetch detailed info for each movie using IMDb IDs
  const detailedResults = await Promise.all(
    searchResults.Search.map(async (movie) => {
      try {
        return await fetchFromApi({ i: movie.imdbID })
      } catch (err) {
        console.error(`Failed to fetch details for ${movie.Title}:`, err)
        return null
      }
    })
  )
  
  // Filter out any null results (in case of errors fetching details)
  return detailedResults.filter(Boolean)
}

// Function for fuzzy matching
export const searchWithFuzzyMatching = async (query) => {
  const results = await fetchMoviesAndDetails(query)
  const fuse = new Fuse(results, { keys: ['Title'], threshold: 0.3 })
  return fuse.search(query).map(result => result.item)
}
