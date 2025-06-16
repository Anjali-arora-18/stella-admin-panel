<template>
  <div class="loader-container">
    <div class="loader"></div>
  </div>
</template>

<script>
export default {
  name: 'LoaderPage',
}
</script>

<style scoped>
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: rgba(255, 255, 255, 0.9);
}

.loader {
  width: 80px;
  height: 80px;
  border: 8px solid #f3f3f3;
  border-radius: 50%;
  border-top: 8px solid #3498db;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
