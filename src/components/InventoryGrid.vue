<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import Sortable, { Swap } from 'sortablejs';
import InventoryItemComponent from './InventoryItem.vue';
import { InventoryItem } from '../mock/ue';

// Mount Swap plugin to Sortable
Sortable.mount(new Swap());

interface Props {
  capacity?: number;
  initialItems?: InventoryItem[];
}

const props = withDefaults(defineProps<Props>(), {
  capacity: 20,
  initialItems: () => []
});

interface Slot {
  index: number;
  item: InventoryItem | null;
}

const slots = ref<Slot[]>([]);
const gridRef = ref<HTMLElement | null>(null);

const initializeGrid = () => {
  slots.value = Array.from({ length: props.capacity }, (_, index) => {
    const item = props.initialItems.find(i => i.slotIndex === index);
    return {
      index,
      item: item || null
    };
  });
};

let sortableInstance: Sortable | null = null;

onMounted(async () => {
  initializeGrid();
  await nextTick();
  
  if (gridRef.value) {

    sortableInstance = Sortable.create(gridRef.value, {
      animation: 150, // Enable animation for better UX
      sort: true, // Must be true for sorting/swapping to work
      swap: true, // Enable Swap plugin
      swapClass: 'sortable-swap-highlight', // Class to apply to the item being swapped with
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      
      // Critical for Game Engine support (removes HTML5 native dependency and uses Mouse Events)
      forceFallback: true, 
      fallbackClass: 'sortable-fallback-drag',
      fallbackOnBody: true,

      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt;

        if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
          return;
        }

        // Perform the SWAP in data
        const itemA = slots.value[oldIndex].item;
        const itemB = slots.value[newIndex].item;

        slots.value[oldIndex].item = itemB;
        slots.value[newIndex].item = itemA;

        // Update slot indexes
        if (slots.value[oldIndex].item) slots.value[oldIndex].item!.slotIndex = oldIndex;
        if (slots.value[newIndex].item) slots.value[newIndex].item!.slotIndex = newIndex;

        console.log(`Swap: Slot ${oldIndex} <-> Slot ${newIndex}`);
      }
    });
  }
});
</script>

<template>
  <div class="inventory-container">
    <div class="inventory-header">
      <h2>BACKPACK</h2>
      <div class="capacity-info">{{ initialItems.length }} / {{ capacity }}</div>
    </div>
    <div ref="gridRef" class="inventory-grid">
      <div
        v-for="slot in slots"
        :key="slot.index"
        class="inventory-slot"
      >
        <InventoryItemComponent v-if="slot.item" :item="slot.item" />
        <div v-else class="empty-slot-content"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inventory-container {
  background: var(--color-bg-panel);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  max-width: 600px;
  width: 100%;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 10px;
}

h2 {
  margin: 0;
  color: var(--color-primary);
  font-weight: 700;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.capacity-info {
  font-family: monospace;
  font-size: 1.2em;
  color: rgba(255, 255, 255, 0.5);
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  user-select: none;
}

.inventory-slot {
  aspect-ratio: 1;
  background: var(--color-slot-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  position: relative;
  transition: all 0.2s;
}

.inventory-slot:hover {
  background: var(--color-slot-hover);
  border-color: rgba(255, 255, 255, 0.2);
}

.empty-slot-content {
  width: 100%;
  height: 100%;
}

/* Highlight the target slot manually */
:global(.sortable-swap-highlight) {
  background: rgba(255, 215, 0, 0.2) !important;
  border-color: var(--color-primary) !important;
  box-shadow: inset 0 0 15px rgba(255, 215, 0, 0.3);
}

.sortable-ghost {
  opacity: 0 !important; /* Hide original */
}

.sortable-fallback-drag {
  cursor: grabbing;
  opacity: 1 !important;
  transform: scale(1.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  background: var(--color-bg-panel);
  border-radius: 8px;
  pointer-events: none;
  z-index: 10000;
}
</style>
