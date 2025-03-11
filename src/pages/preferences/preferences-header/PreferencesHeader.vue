<template>
  <VaAvatar size="large" color="warning"
    ><span class="text-4xl">
      <svg
        width="50"
        height="50"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        stroke="#000"
        stroke-width="8"
      >
        <circle cx="50" cy="30" r="15" />
        <path d="M30 80 C30 60, 70 60, 70 80" />
      </svg> </span
  ></VaAvatar>
  <div class="flex flex-col justify-center">
    <h2 class="text-[28px] md:text-[32px] leading-10 font-bold">{{ store.userName }}</h2>
    <div class="flex space-x-1 text-[13px] leading-4">
      <p>Member since</p>
      <p>{{ store.memberSince }}</p>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useUserStore } from '../../../stores/user-store'

const store = useUserStore()
</script>
