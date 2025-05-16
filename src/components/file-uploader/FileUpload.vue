<template>
  <div class="file-upload-container">
    <div class="upload-area" :class="{ dragging: isDragging }" @dragover.prevent @drop.prevent="handleFileDrop">
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedFileTypes"
        class="file-input"
        :multiple="allowMultiple"
        @change="handleFileSelect"
      />

      <div class="upload-content">
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Drag and drop files here or click to browse</p>
      </div>
    </div>

    <div v-if="uploadProgress" class="progress-bar">
      <div :style="{ width: `${uploadProgress}%` }" class="progress"></div>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'FileUpload',

  props: {
    acceptedFileTypes: {
      type: String,
      default: '*/*',
    },
    allowMultiple: {
      type: Boolean,
      default: false,
    },
    maxFileSize: {
      type: Number,
      default: 5242880, // 5MB in bytes
    },
    selectedRest: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      isDragging: false,
      uploadProgress: 0,
      errorMessage: '',
      selectedFile: null,
    }
  },
  methods: {
    handleFileDrop(e) {
      this.isDragging = false
      const files = e.dataTransfer.files
      if (files.length) {
        this.processFiles(files)
      }
    },

    handleFileSelect(e) {
      const files = e.target.files
      if (files.length) {
        this.processFiles(files)
      }
    },

    processFiles(files) {
      if (!this.allowMultiple && files.length > 1) {
        this.errorMessage = 'Only one file can be uploaded at a time'
        return
      }

      const file = files[0]
      if (file.size > this.maxFileSize) {
        this.errorMessage = 'File size exceeds the limit'
        return
      }

      this.errorMessage = ''
      this.selectedFile = file
      this.uploadFile()
    },

    async uploadFile() {
      if (!this.selectedFile) return
      const url = import.meta.env.VITE_API_BASE_URL
      const formData = new FormData()
      formData.append('file', this.selectedFile)

      try {
        // First API call to upload the file
        const uploadResponse = await axios.post(url + '/uploads', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          },
        })
        if (uploadResponse.status === 200) {
          // Second API call to create asset
          const assetResponse = await axios.post(url + '/assets', {
            name: uploadResponse.data.key,
            type: 'image',
            url: uploadResponse.data.url,
            mimeType: uploadResponse.data.mimeType,
            size: uploadResponse.data.fileSize,
            outletId: this.selectedRest,
            createdBy: window.sessionStorage.getItem('user'),
          })

          this.$emit('upload-success', assetResponse.data)
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Upload failed'
      } finally {
        this.uploadProgress = 0
        this.selectedFile = null
      }
    },
  },
}
</script>

<style scoped>
.file-upload-container {
  width: 100%;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  position: relative;
  cursor: pointer;
}

.upload-area.dragging {
  border-color: #2196f3;
  background-color: rgba(33, 150, 243, 0.1);
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-content {
  color: #666;
}

.progress-bar {
  margin-top: 10px;
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.progress {
  height: 100%;
  background-color: #2196f3;
  border-radius: 4px;
  transition: width 0.2s ease-in-out;
}

.error-message {
  color: #f44336;
  margin-top: 10px;
  font-size: 14px;
}
</style>
