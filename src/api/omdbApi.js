// src/omdbService.js
import axios from 'axios'

const API_KEY = 'd9828266'
const BASE_URL = 'https://www.omdbapi.com/'

export const getMovieDetails = async (title) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        apikey: API_KEY,
        t: title
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching movie details:', error)
    throw error
  }
}
