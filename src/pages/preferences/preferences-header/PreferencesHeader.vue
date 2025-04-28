<template>
  <VaAvatar size="large" color="warning"><span class="text-4xl"> 😍 </span></VaAvatar>
  <div class="flex flex-col justify-center">
    <h2 class="text-[28px] md:text-[32px] leading-10 font-bold">{{ store.firstName.charAt(0).toUpperCase() + store.firstName.slice(1) + ' ' +
    store.lastName.charAt(0).toUpperCase() + store.lastName.slice(1) }}</h2>
    <!-- <div class="flex space-x-1 text-[13px] leading-4">
      <p>Member since</p>
      <p>{{ store.memberSince }}</p>
    </div> -->
  </div>
</template>
<script lang="ts" setup>

const store = JSON.parse(sessionStorage.getItem("userDetails"));
</script>
