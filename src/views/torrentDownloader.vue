<template>
  <div class="torrent-downloader">
    <p>Select a .torrent File</p>

    <!-- File input for selecting the torrent file -->
    <input type="file" @change="handleFileUpload" accept=".torrent" />

    <p v-if="file">Selected file: {{ file.name }}</p>
  </div>
</template>

<script>
// imports...
// TODO: check why this import causes errors, temp fix is loading the cdn in index.html (which i hate...)
// import WebTorrent from 'webtorrent'

export default {
  data() {
    return {
      file: null,
      progress: 0
    }
  },
  created() {
    this.client = new window.WebTorrent() // initialize client once the component is created...
  },
  methods: {
    // Handle the file upload event
    handleFileUpload(event) {
      const selectedFile = event.target.files[0] // Get the selected file
      if (selectedFile) {
        this.file = selectedFile
        console.log('File selected:', this.file) // Log the file to check
        this.loadTorrent(this.file)
      } else {
        alert('Please select a valid .torrent file')
      }
    },
    loadTorrent(torrentFile) {
      this.client.add(torrentFile, (torrent) => {
        console.log('Torrent info:', torrent)

        torrent.on('download', (bytes) => {
          console.log('just downloaded: ' + bytes)
          console.log('progress: ' + torrent.progress)
          this.downloadProgress(torrent)
        })

        torrent.on('done', () => {
          console.log('Download finished!')
          this.downloadFiles(torrent.files)
        })
      })
    },
    downloadProgress(torrent) {
      const downloaded = torrent.downloaded
      const total = torrent.length
      this.progress = (downloaded / total) * 100
    },
    downloadFiles(files) {
      files.forEach((file) => {
        file.getBuffer((err, buffer) => {
          if (err) throw err

          // Create a Blob from the buffer
          const blob = new Blob([buffer], { type: file.type })
          const url = window.URL.createObjectURL(blob)

          // Create an anchor element to trigger download
          const a = document.createElement('a')
          a.href = url
          a.download = file.name
          document.body.appendChild(a)
          a.click()
          a.remove()

          // Clean up
          window.URL.revokeObjectURL(url)
        })
      })
    }
  }
}
</script>

<style scoped lang="css"></style>
