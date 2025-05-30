<template>
    <!-- <h1 class="page-title font-bold">Call Centers</h1> -->
    <div class="grid grid-cols-1 md:grid-cols-7 gap-4">

        <!-- LEFT SECTION -->
        <div class="md:col-span-5 bg-slate-100 p-4">
            <VaCard>
                <VaCardContent>
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div class="flex flex-wrap gap-4">
                            <a href="#appetizers" class="bg-blue-500 text-white px-4 py-2 rounded-2xl">Appetizers</a>
                            <a href="#main_course" class="bg-gray-200 px-4 py-2 rounded-2xl hover:bg-gray-300">Main
                                Courses</a>
                            <a href="#desserts" class="bg-gray-200 px-4 py-2 rounded-2xl hover:bg-gray-300">Desserts</a>
                            <a href="#beverages"
                                class="bg-gray-200 px-4 py-2 rounded-2xl hover:bg-gray-300">Beverages</a>
                            <a href="#salads" class="bg-gray-200 px-4 py-2 rounded-2xl hover:bg-gray-300">Salads</a>
                        </div>
                        <div class="flex"><span class="bg-black px-4 py-4 text-white text-2xl rounded"> 20:35</span>
                        </div>
                    </div>

                    <MenuSection id="appetizers" title="Appetizers" :items="appetizers" />
                    <MenuSection id="main_course" title="Main Courses" :items="main_courses" />
                    <MenuSection id="desserts" title="Desserts" :items="desserts" />
                </VaCardContent>
            </VaCard>






        </div>

        <!-- RIGHT SECTION -->
        <div class="md:col-span-2 bg-slate-100 p-4">
            <div class="flex flex-col gap-4">
                <VaCard>
                    <VaCardContent>
                        <CustomerDetails />
                    </VaCardContent>
                </VaCard>
                <VaCard>
                    <VaCardContent>

                        <OrderDetails />

                    </VaCardContent>
                </VaCard>
            </div>
        </div>

    </div>

</template>

<script setup>
import MenuSection from '@/pages/callCenters/widgets/MenuSections.vue';
import CustomerDetails from '@/pages/callCenters/widgets/CustomerDetails.vue';
import OrderDetails from '@/pages/callCenters/widgets/OrderDetails.vue';

const appetizers = [
    {
        id: 1,
        title: 'Grilled Shrimp',
        price: '€12.50',
        icon: '/allergens/vegan.png'
    },
    {
        id: 2,
        title: 'Caesar Salad',
        price: '€8.90',
        icon: '/allergens/spicy.png'
    },
    {
        id: 3,
        title: 'Grilled Shrimp',
        price: '€12.50',
        icon: '/allergens/vegan.png'
    },
    {
        id: 4,
        title: 'Caesar Salad',
        price: '€8.90',
        icon: '/allergens/spicy.png'
    },
    {
        id: 3,
        title: 'Grilled Shrimp',
        price: '€12.50',
        icon: '/allergens/vegan.png'
    },
    {
        id: 4,
        title: 'Caesar Salad',
        price: '€8.90',
        icon: '/allergens/spicy.png'
    }
];
const main_courses = [
    {
        id: 1,
        title: 'Grilled Shrimp',
        price: '€12.50',
        icon: '/allergens/vegan.png'
    },
    {
        id: 2,
        title: 'Caesar Salad',
        price: '€8.90',
        icon: '/allergens/spicy.png'
    },
    {
        id: 3,
        title: 'Grilled Shrimp',
        price: '€12.50',
        icon: '/allergens/vegan.png'
    }
];
const desserts = [
    {
        id: 1,
        title: 'Grilled Shrimp',
        price: '€12.50',
        icon: '/allergens/vegan.png'
    },
    {
        id: 2,
        title: 'Caesar Salad',
        price: '€8.90',
        icon: '/allergens/spicy.png'
    },
    {
        id: 3,
        title: 'Grilled Shrimp',
        price: '€12.50',
        icon: '/allergens/vegan.png'
    }
];
</script>