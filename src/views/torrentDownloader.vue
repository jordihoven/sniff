<template>
  <div class="app-container">
    <div class="torrent-downloader">
      <Dropzone :acceptedTypesString="acceptedTypesString" :onFileUpload="handleFileUpload" />
      <div class="or">
        <hr />
        <span>or</span>
        <hr />
      </div>
      <input
        class="magnetlink-input"
        type="text"
        v-model="magnetLink"
        placeholder="Paste a magnet link..."
        @keyup.enter="handleMagnetLink"
      />
    </div>
    <div class="results-wrapper">
      <div v-if="!downloading" class="empty-state">
        <span>Starts downloading as soon as you add a torrent... ✨</span>
      </div>
      <div v-else class="download-card">
        <p class="medium">{{ file?.name || 'Magnet link' }}</p>
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: progress + '%', backgroundColor: downloadFinished ? '#36B643' : '#0070f3' }"></div>
        </div>
        <span v-if="downloadFinished">Download finished!</span>
        <div v-else>
          <span>{{ downloadspeed }} Kb/s</span>
          <span>, </span>
          <span>{{ timeRemaining }} minutes remaining...</span>
        </div>
      </div>
    </div>
  </div>

  <button class="search-movies-button" @click="showMovieSearch">
    <LucideClapperboard class="icon" />
    Search movies
  </button>
  <Transition>
    <MovieSearch ref="movieSearch" v-if="isMovieSearchVisible" />
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import { toast } from 'toaster-ts'

// components
import Dropzone from '../components/molecules/Dropzone.vue'
import MovieSearch from '../components/organisms/movieSearch.vue'

// utils
import { onClickOutside } from '@vueuse/core'

// variables
const movieSearch = ref(null)
const isMovieSearchVisible = ref(false)
const magnetLink = ref('')

onClickOutside(movieSearch, () => {
  isMovieSearchVisible.value = false
})

const showMovieSearch = () => {
  isMovieSearchVisible.value = true
}

const acceptedTypesString = '.torrent'
const file = ref(null)
const progress = ref(0)
const downloadspeed = ref(0)
const timeRemaining = ref(0)
const downloadFinished = ref(0)
const downloading = ref(false)

let client

const handleFileUpload = (files) => {
  const selectedFile = files[0]
  if (selectedFile) {
    file.value = selectedFile
    console.log('File selected:', file.value)
    loadTorrent(file.value)
  } else {
    alert('Please select a valid .torrent file')
  }
}

const handleMagnetLink = () => {
  if (magnetLink.value) {
    loadTorrent(magnetLink.value)
    magnetLink.value = '' // Reset the input after loading
  } else {
    alert('Please enter a valid magnet link')
  }
}

const loadTorrent = (torrentFile) => {
  client.add(torrentFile, (torrent) => {
    console.log('Torrent info:', torrent)
    console.log('Files:', torrent.files)

    torrent.on('download', (bytes) => {
      downloading.value = true
      console.log('just downloaded: ' + bytes)
      progress.value = (torrent.progress * 100).toFixed(1)
      downloadspeed.value = (torrent.downloadSpeed / 1024).toFixed(1)
      timeRemaining.value = Math.max(Math.floor(torrent.timeRemaining / 60000))
    })

    torrent.on('done', () => {
      downloading.value = false
      console.log('Download finished!')
      downloadFinished.value = true
      toast.success('Torrent downloaded 🎉')
    })

    torrent.on('warning', (message) => {
      console.warn('Torrent warning:', message)
      toast.warning(message)
    })

    torrent.on('error', (err) => {
      console.error('Torrent error:', err)
    })
  })
}

const downloadFiles = (files) => {
  files.forEach((file) => {
    file.getBuffer((err, buffer) => {
      if (err) throw err

      const blob = new Blob([buffer], { type: file.type })
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(url)
    })
  })
}

onMounted(() => {
  client = new window.WebTorrent()
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.torrent-downloader {
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--stroke);
  padding: var(--s-spacing);
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

.results-wrapper {
  overflow: auto;
  padding: var(--m-spacing) var(--s-spacing) var(--xl-spacing) var(--s-spacing);
}

.search-movies-button {
  position: fixed;
  display: flex;
  gap: 4px;
  padding: var(--xxs-spacing);
  background-color: var(--bg-main);
  border-radius: var(--radius);
  border: var(--border);
  color: var(--text-secondary);
  bottom: var(--s-spacing);
  left: 50%;
  transform: translateX(-50%);
  z-index: 69;

  display: flex;
  padding: var(--xs-spacing);
  border-radius: var(--radius);
  transition: var(--transition);
}
.search-movies-button:hover {
  background-color: var(--bg-primary);
}

.v-enter-active,
.v-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.v-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px) scale(0.95); /* Include translateX for centering */
}

.v-enter-to {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1); /* Keep translateX */
}

.v-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1); /* Keep translateX */
}

.v-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px) scale(0.95); /* Include translateX */
}

.download-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: var(--bg-primary);
  border: 1px solid var(--stroke);
  border-radius: var(--xs-spacing);
  padding: var(--xs-spacing);
  max-width: 40em;
  margin: 0 auto;
}

.progress-container {
  width: 100%;
  background-color: var(--stroke);
  border-radius: 5px;
  height: var(--xs-spacing);
  overflow: hidden;
}

.progress-bar {
  background-color: var(--primary);
  height: 100%;
  transition: width 0.3s;
}

.magnetlink-input {
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
  padding: var(--xs-spacing);
  background-color: var(--bg-secondary);
  font-size: var(--span);
}

.dropzone,
.magnetlink-input {
  width: 100%;
  max-width: 40rem;
}

.or {
  display: flex;
  align-items: center;
  gap: var(--xs-spacing);
  width: 100%;
  max-width: 40rem;
}

.or hr {
  margin: 0;
  flex: 1;
  background-color: var(--stroke);
}
</style>
