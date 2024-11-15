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
      <div v-if="!torrentInfo" class="empty-state">
        <span>Shows torrent properties as soon as you add a torrent... ✨</span>
      </div>
      <div v-else class="torrent-specs">
        <h3 class="torrent-name">{{ torrentInfo.name }}</h3>
        <div class="torrent-spec">
          <span>Magnetlink</span>
          <div class="ellipsis">{{ torrentInfo.magnetURI }}</div>
        </div>
        <div class="torrent-spec">
          <span>Torrent files</span>
          <div v-for="file in torrentInfo.files" :key="file.name">
            {{ file.name }}
            {{ file.size }} Kb
          </div>
        </div>
        <div class="torrent-spec">
          <span>Hash</span>
          <div class="ellipsis">{{ torrentInfo.infoHash }}</div>
        </div>
        <!-- {{ torrentInfo.created }}
        {{ torrentInfo.createdBy }}
        {{ torrentInfo.announce }} -->
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
const acceptedTypesString = '.torrent'

let client

const handleFileUpload = (files) => {
  const selectedFile = files[0]
  if (selectedFile) {
    loadTorrent(selectedFile)
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
        size: file.length,
      })),
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

.torrent-name {
  margin-bottom: var(--xs-spacing);
}

.ellipsis {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
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
