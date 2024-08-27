<template>
  <div class="app-container">
    <div class="search-wrapper">
      <input
        class="search"
        v-model="searchQuery"
        @input="fetchMovies"
        placeholder="Search movie by title..."
      />
    </div>
    <div class="results-wrapper">
      <div v-if="movies.length" class="results-list">
        <div v-for="movie in movies" :key="movie.imdbID" class="movie-card">
          <div class="movie-img">
            <img :src="movie.Poster" alt="Movie Poster" />
          </div>
          <div class="movie-details">
            <p>{{ movie.Title }}</p>
            <span>{{ movie.Plot }}</span>
            <span>{{ movie.Runtime }}</span>
            <span>{{ movie.Director }}</span>
          </div>
        </div>
      </div>
      <div class="empty-state" v-else>
        <p>Nothing to show</p>
        <span>Once you finish typing, movies will show here...</span>
      </div>
    </div>
    <!-- <p v-if="error">{{ error }}</p> -->
  </div>
</template>

<script>
import { ref } from 'vue'
import { searchWithFuzzyMatching } from '../api/omdbApi'

export default {
  setup() {
    const searchQuery = ref('')
    const movies = ref([])
    const error = ref(null)

    // debounce function, so that api call waits for user to finish typing...
    function debounce(func, wait) {
      let timeout
      return function (...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
      }
    }

    // fetch movies from from api...
    const fetchMovies = debounce(async () => {
      if (searchQuery.value.trim()) {
        try {
          movies.value = await searchWithFuzzyMatching(searchQuery.value)
        } catch (err) {
          error.value = 'Failed to fetch movies'
          console.error('Failed to fetch movies:', err)
        }
      } else {
        movies.value = [] // clear movie list when query is empty...
      }
    }, 700)

    return {
      searchQuery,
      movies,
      error,
      fetchMovies
    }
  }
}
</script>

<style scoped lang="css">
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.results-wrapper {
  overflow: auto;
  padding: var(--m-spacing) var(--s-spacing);
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
  margin-bottom: var(--m-spacing);
  padding: var(--xs-spacing);
}
.search:hover {
  border: 1px solid var(--primary);
  background-color: var(--bg-secondary);
  box-shadow: var(--box-shadow);
}

.movie-card {
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
  padding: var(--xs-spacing);
  background-color: var(--bg-primary);
  display: flex;
  transition: var(--transition);
  gap: var(--xs-spacing);
}
.movie-card:hover {
  filter: brightness(98%);
}

.movie-details {
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
}

/* TODO: figure out a way to have responsive images playing nicely... */
.movie-img {
  flex-shrink: 0;
  width: 8rem;
  aspect-ratio: 2 / 3;
}
.movie-card img {
  border-radius: var(--radius);
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.results-list {
  flex-direction: column;
  gap: var(--xs-spacing);
}
.results-list,
.search {
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
</style>
