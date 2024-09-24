<template>
  <div class="app-container">
    <div class="torrent-downloader">
      <div ref="dropZoneRef" class="dropzone" :class="{ dragover: isOverDropZone }" @click="openFileExplorer">
        <p class="medium">Drag & drop a .torrent file, or click to use file explorer</p>
        <input type="file" :accept="acceptedTypesString" ref="fileInput" @change="handleFilesSelected" multiple hidden />
      </div>
    </div>
    <div class="results-wrapper">
      <div v-if="!file" class="empty-state">
        <p class="medium">Nothing to show</p>
        <span>Starts downloading as soon as you drop a .torrent file... ✨</span>
      </div>
      <div v-if="file">
        <p>Filename: {{ file.name }}</p>
        <p>Progress: {{ progress.toFixed(2) }} %</p>
      </div>
    </div>
  </div>

  <button class="search-movies-button" @click="toggleMovieSearch">
    <LucideClapperboard class="icon" />
    Search movies
  </button>
  <MovieSearch v-if="isMovieSearchVisible" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDropZone } from '@vueuse/core'
import MovieSearch from './movieSearch.vue'

const isMovieSearchVisible = ref(false)

const toggleMovieSearch = () => {
  isMovieSearchVisible.value = !isMovieSearchVisible.value
}

const dropZoneRef = ref(null)
const fileInput = ref(null)
const file = ref(null)
const progress = ref(0)
const acceptedTypesString = '.torrent'
const { isOverDropZone } = useDropZone(dropZoneRef, onDrop)

let client

function onDrop(files) {
  handleFileUpload(files)
}

const openFileExplorer = () => {
  fileInput.value.click()
}

const handleFilesSelected = (event) => {
  const files = event.target.files
  handleFileUpload(files)
}

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

const loadTorrent = (torrentFile) => {
  client.add(torrentFile, (torrent) => {
    console.log('Torrent info:', torrent)

    torrent.on('download', (bytes) => {
      console.log('just downloaded: ' + bytes)
      downloadProgress(torrent)
    })

    torrent.on('done', () => {
      console.log('Download finished!')
      downloadFiles(torrent.files)
    })
  })
}

const downloadProgress = (torrent) => {
  const downloaded = torrent.downloaded
  const total = torrent.length
  progress.value = (downloaded / total) * 100
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

.dropzone {
  background-color: var(--bg-secondary);
  border: 2px dashed var(--stroke);
  border-radius: var(--radius);
  padding: var(--s-spacing);
  text-align: center;
  transition: var(--transition);
  flex: 1;
  position: relative;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-width: 30em;
  margin: 0 auto;
}
.dropzone:hover {
  cursor: pointer;
  filter: brightness(95%);
}

.dropzone.dragover {
  border-color: var(--primary);
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
</style>
