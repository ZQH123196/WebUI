import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import InventoryView from '../views/InventoryView.vue'
import HomeView from '../views/HomeView.vue'
import compareDnD from '../views/compareDnD.vue'
import TestDnDView from '../views/TestDnDView.vue'

const routes = [
    { path: '/', component: HomeView },
    {
        path: '/inventory',
        component: InventoryView
    },
    {
        path: '/compare',
        component: compareDnD
    },
    {
        path: '/test-dnd',
        component: TestDnDView
    }
]

// Logic adjustment: The existing App.vue loads data and passes it to InventoryGrid.
// If we route to InventoryGrid directly, it expects props.
// Better approach: Create a view component for Inventory.

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
