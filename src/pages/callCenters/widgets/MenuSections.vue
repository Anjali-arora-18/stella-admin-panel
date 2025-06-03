<!-- components/MenuSection.vue -->
<template>
    <section :id="id" class="mt-5">
        <h3 class="font-bold text-lg border-b-2 border-blue-500 pb-2">{{ title }}</h3>

        <div>
            <div class="pt-8 flex flex-col sm:flex-row gap-4 sm:min-w-max">
                <MenuCard v-for="item in items" :key="item.id" :item="item" />
            </div>
        </div>
    </section>
</template>

<script setup>
import MenuCard from '@/pages/callCenters/widgets/MenuCard.vue';

defineProps({
    id: String,
    title: String,
    items: Array
});
</script>
