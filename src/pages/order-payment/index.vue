<template>
  <div></div>
</template>
<script>
import { useOrderStore } from '@/stores/order-store'
import { mapState } from 'pinia'
export default {
  computed: {
    ...mapState(useOrderStore, ['paymentId']),
  },
  mounted() {
    window.close()
  },
}
</script>
