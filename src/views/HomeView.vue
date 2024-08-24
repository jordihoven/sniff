<template>
  <div>
    <input
      class="search"
      v-model="searchQuery"
      @input="fetchMovies"
      placeholder="Search movie by title..."
    />
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

    const fetchMovies = async () => {
      if (searchQuery.value.trim()) {
        try {
          movies.value = await searchWithFuzzyMatching(searchQuery.value)
        } catch (err) {
          error.value = 'Failed to fetch movies'
          console.error('Failed to fetch movies:', err)
        }
      } else {
        movies.value = [] // Clear movie list when query is empty
      }
    }

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
.search {
  background-color: var(--bg-primary);
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
  padding: var(--xs-spacing);
  font-size: var(--body);
  font-weight: var(--medium);
  width: 100%;
  transition: var(--transition);
  margin-bottom: var(--m-spacing);
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
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
}
</style>
