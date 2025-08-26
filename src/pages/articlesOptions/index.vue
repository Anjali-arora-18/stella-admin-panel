<template>
  <div>
    <div class="rounded border bg-white p-3 w-full mt-4" style="box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)">
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
::v-deep(.va-tab__label) {
  font-size: 16px;
}

::v-deep(.va-tab--active .va-tab__label) {
  font-size: 17px;
}
</style>
