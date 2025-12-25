<script setup lang="ts">
import { ref, onMounted } from 'vue';
import InventoryGrid from '../components/InventoryGrid.vue';
import { InventoryData } from '../mock/ue';
// Ensure mock is loaded for browser dev
import '../mock/ue'; 

const inventoryData = ref<InventoryData | null>(null);

const loadData = () => {
  try {
    const rawData = window.ue.getalljson();
    inventoryData.value = JSON.parse(rawData);
  } catch (e) {
    console.error("Failed to load inventory data", e);
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="inventory-view">
    <div v-if="inventoryData">
      <InventoryGrid 
        :capacity="inventoryData.capacity" 
        :initialItems="inventoryData.items" 
      />
    </div>
    <div v-else class="loading">
      Loading Inventory...
    </div>
  </div>
</template>

<style scoped>
.inventory-view {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.loading {
  font-size: 1.5em;
  color: var(--color-accent);
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.5; }
  to { opacity: 1; }
}
</style>
