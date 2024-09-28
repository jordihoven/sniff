<template>
  <div class="search-container">
    <div class="search-wrapper">
      <div class="input-container">
        <input class="search" v-model="searchQuery" @input="fetchMovies" placeholder="Search movie by title..." />
        <LucideSearch class="icon search-icon"></LucideSearch>
      </div>
    </div>
    <div class="results-wrapper">
      <div v-if="loading" class="empty-state">
        <p class="medium">Loading flicks...</p>
        <span>Refreshes automatically when you change your searchterm ✨</span>
      </div>
      <div v-else-if="movies.length" class="results-list">
        <div v-for="movie in movies" :key="movie.imdbID" class="movie-card">
          <div class="movie-details">
            <div class="movie-img">
              <div v-if="movie.Poster === 'N/A'" class="no-poster">📽️</div>
              <img v-else :src="movie.Poster" alt="Movie Poster" />
            </div>
            <div class="name-rating-duration">
              <p class="medium">{{ movie.Title }}</p>
              <div class="details">
                <span class="movie-detail"><LucideHourglass class="icon"></LucideHourglass>{{ movie.Runtime }}</span>
                <span class="movie-detail"><LucideStar class="icon"></LucideStar>{{ movie.imdbRating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p class="medium">Nothing to show</p>
        <span>Searches automatically when you finish typing... ✨</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const searchQuery = ref('')
    const movies = ref([])
    const error = ref(null)
    const loading = ref(false)

    // Debounce function, so that api call waits for user to finish typing...
    function debounce(func, wait) {
      let timeout
      return function (...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
      }
    }

    // Function to fetch detailed movie data by IMDb ID
    const fetchMovieDetails = async (movie) => {
      try {
        const response = await fetch(`/.netlify/functions/omdbFetch?id=${movie.imdbID}`)
        const detailedData = await response.json()
        return {
          Title: detailedData.Title,
          Year: detailedData.Year,
          Runtime: detailedData.Runtime,
          imdbRating: detailedData.imdbRating,
          Poster: detailedData.Poster,
          imdbID: detailedData.imdbID
        }
      } catch (err) {
        console.error('Error fetching movie details:', err)
        return movie // Return the original movie if detail fetch fails
      }
    }

    // Fetch movies from API
    const fetchMovies = debounce(async () => {
      try {
        loading.value = true
        const response = await fetch(`/.netlify/functions/omdbFetch?title=${searchQuery.value}`)
        const data = await response.json()

        if (data && Array.isArray(data.Search)) {
          // Fetch details for each movie
          const detailedMoviesPromises = data.Search.map(fetchMovieDetails)
          movies.value = await Promise.all(detailedMoviesPromises) // Wait for all details to load
        } else {
          error.value = data.error || 'No movies found'
          movies.value = []
        }
      } catch (err) {
        console.error(err)
        error.value = 'Error fetching data'
      } finally {
        loading.value = false
      }
    }, 700)

    return {
      searchQuery,
      movies,
      error,
      loading,
      fetchMovies
    }
  }
}
</script>

<style scoped lang="css">
.search-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 100;
  top: 40px;
  background: var(--bg-main);
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - var(--m-spacing));
  max-width: 40em;
}

.results-wrapper {
  overflow: auto;
  max-height: 30em;
  padding: var(--s-spacing);
}

.search-wrapper {
  border-bottom: 1px solid var(--stroke);
  padding: var(--s-spacing);
}

.search {
  background-color: var(--bg-primary);
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
  font-size: var(--body);
  font-weight: var(--medium);
  width: 100%;
  transition: var(--transition);
  padding: var(--xs-spacing) var(--xs-spacing) var(--xs-spacing) 28px;
}
.search:hover {
  border: 1px solid var(--primary);
  background-color: var(--bg-secondary);
  box-shadow: var(--box-shadow);
}

.input-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--xs-spacing); /* Adjust to position the icon correctly */
  top: 50%;
  transform: translateY(-50%); /* Center icon vertically */
  pointer-events: none; /* Prevent icon from blocking clicks on input */
}

.movie-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--s-spacing);
  transition: var(--transition);
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
  padding: var(--xs-spacing);
  background-color: var(--bg-primary);
}
.movie-card:hover {
  filter: brightness(98%);
}

.movie-details {
  display: flex;
  gap: var(--s-spacing);
  justify-content: center;
  align-items: center;
}
.movie-detail {
  display: flex;
  align-items: center;
  gap: var(--xs-spacing);
  padding: 4px;
  background-color: var(--bg-secondary);
  border-radius: var(--radius);
  width: fit-content;
}

.name-rating-duration {
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
}

/* TODO: figure out a way to have responsive images playing nicely... */
.movie-img {
  flex-shrink: 0;
  width: 4rem;
  aspect-ratio: 2 / 3;
}
.movie-card img {
  border-radius: var(--radius);
  width: 100%;
  height: 100%;
  object-fit: cover;
  box-shadow: 0 0 8px var(--bg-secondary); /* TODO: find a subtle dropshadow color that works on light & darkmode */
}

.movie-card .no-poster {
  background-color: var(--bg-secondary);
  height: 100%;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
}

.results-list {
  flex-direction: column;
  gap: var(--xs-spacing);
}
.results-list,
.input-container {
  max-width: 60rem;
  display: flex;
  margin: 0 auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
  margin: 0 auto;
  max-width: 60rem;
  align-items: center;
}
.empty-state span {
  text-align: center;
}

.details {
  display: flex;
  gap: var(--xs-spacing);
}
</style>
