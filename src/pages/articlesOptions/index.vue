<template>
  <div>
    <div class="rounded bg-white p-4 w-full mt-4">
      <VaTabs v-model="activeTab" grow>
        <template #tabs>
          <VaTab label="Option Groups" />
          <VaTab label="Options" />
        </template>
        <RouterView></RouterView>
      </VaTabs>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ArticlesOptionsPage',
  components: {},

  data() {
    return {
      activeTab: 1,
    }
  },
  watch: {
    activeTab: function () {
      if (this.activeTab === 0 && this.$route.name !== 'articlesOptionsGroups') {
        this.$router.push({ name: 'articlesOptionsGroups' })
      } else if (this.activeTab === 1 && this.$route.name !== 'articlesOptionsList') {
        this.$router.push({ name: 'articlesOptionsList' })
      }
    },
  },
  mounted() {
    if (this.$route.name === 'articlesOptionsGroups') {
      this.activeTab = 0
    } else {
      this.activeTab = 1
    }
  },
  methods: {},
}
</script>
<style scoped>
::v-deep(.va-tabs__wrapper) {
  box-shadow: none !important;
}

::v-deep(.va-tab__label) {
  font-size: 17px;
}

::v-deep(.va-tab--active .va-tab__label) {
  font-size: 18px;
}
</style>
