<template>
  <div class="app-container">
    <div class="torrent-downloader">
      <Dropzone :acceptedTypes="acceptedTypes" :onFileUpload="handleFileUpload" />
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
      <div v-if="!torrentInfo" class="empty-state">
        <span>Shows torrent properties as soon as you add a torrent... ✨</span>
      </div>
      <div v-else class="torrent-specs">
        <div class="torrent-header">
          <h3 v-if="torrentInfo.name" class="torrent-name">{{ torrentInfo.name }}</h3>
          <span>{{ formatFileSize(torrentInfo.totalSize) }}</span>
        </div>
        <div v-if="torrentInfo.magnetURI" class="torrent-spec">
          <span>Magnetlink</span>
          <div class="clip-text">{{ torrentInfo.magnetURI }}</div>
        </div>
        <div v-if="torrentInfo.files" class="torrent-spec torrent-files">
          <span>Torrent files</span>
          <div class="torrent-file" v-for="file in torrentInfo.files" :key="file.name">
            <div class="clip-text">{{ file.name }}</div>
            <div>{{ formatFileSize(file.size) }}</div>
          </div>
        </div>
        <div v-if="torrentInfo.infoHash" class="torrent-spec">
          <span>Hash</span>
          <div class="clip-text">{{ torrentInfo.infoHash }}</div>
        </div>
        <div v-if="torrentInfo.announce" class="torrent-spec torrent-files">
          <span>Trackers</span>
          <div class="torrent-file" v-for="tracker in torrentInfo.announce" :key="(tracker, index)">
            <div class="clip-text">{{ tracker }}</div>
          </div>
        </div>
        <div v-if="torrentInfo.created" class="torrent-spec">
          <span>Created at</span>
          {{ formatDate(torrentInfo.created) }}
        </div>
        <div v-if="torrentInfo.createdBy" class="torrent-spec">
          <span>Created by</span>
          {{ torrentInfo.createdBy }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'toaster-ts'

// components
import Dropzone from '../components/molecules/Dropzone.vue'

// variables
const magnetLink = ref('')
const torrentInfo = ref(null)
const acceptedTypes = '.torrent'

let client

const handleFileUpload = (files) => {
  const selectedFile = files[0]
  if (selectedFile && selectedFile.name.endsWith(acceptedTypes)) {
    loadTorrent(selectedFile)
  } else {
    toast.error('Only .torrent files are supported... ❤️‍🩹')
  }
}

const handleMagnetLink = () => {
  const isValidMagnetLink = (link) => /^magnet:\?xt=.+/.test(link)
  if (magnetLink.value && isValidMagnetLink(magnetLink.value)) {
    loadTorrent(magnetLink.value)
    magnetLink.value = '' // Reset the input after loading
  } else {
    toast.error('No magnetlink found... 🧲')
  }
}

function formatFileSize(bytes) {
  const units = ['Bytes', 'Kb', 'Mb', 'Gb', 'Tb']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + units[i]
}

function formatDate(date) {
  if (!date) return ''
  const options = { year: 'numeric', month: 'short', day: 'numeric' } // Short month, numeric day, and year
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date))
}

const loadTorrent = (torrentFile) => {
  client.add(torrentFile, (torrent) => {
    // get info from the .torrent file
    const info = {
      name: torrent.name,
      totalSize: torrent.length,
      magnetURI: torrent.magnetURI,
      infoHash: torrent.infoHash,
      created: torrent.created,
      createdBy: torrent.createdBy,
      announce: torrent.announce,
      files: torrent.files.map((file) => ({
        name: file.name,
        size: file.length
      }))
    }
    torrentInfo.value = info

    toast.success(`${torrent.name} sniffed 👀`)

    client.remove(torrent, () => {
      console.log('Torrent metadata processed and removed from client.')
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

.torrent-header {
  display: flex;
  flex-direction: column;
  gap: var(--xs-spacing);
  justify-content: center;
  align-items: center;
  margin: var(--xs-spacing) 0;
  text-align: center;
}
.torrent-header h3 {
  margin: 0;
}

.torrent-specs {
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

.torrent-spec {
  padding: var(--xs-spacing);
  background-color: var(--bg-secondary);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.torrent-files {
  max-height: 30vh;
  overflow: auto;
}

.torrent-file {
  display: flex;
  justify-content: space-between;
  background-color: var(--stroke);
  border-radius: var(--radius);
  padding: 4px;
}

.torrent-name {
  margin-bottom: var(--xs-spacing);
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
