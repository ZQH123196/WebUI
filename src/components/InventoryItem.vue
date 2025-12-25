<script setup lang="ts">
import { InventoryItem } from '../mock/ue';

interface Props {
  item: InventoryItem;
}

const props = defineProps<Props>();
</script>

<template>
  <div
    class="inventory-item"
    :class="`rarity-${item.rarity}`"
    :data-id="item.id"
  >
    <span class="icon">{{ item.icon }}</span>
    <span class="name">{{ item.name }}</span>
  </div>
</template>

<style scoped>
.inventory-item {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  cursor: grab;
  user-select: none;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
  position: relative;
  overflow: hidden;
}

.inventory-item:active {
  cursor: grabbing;
}

.inventory-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
  z-index: 10;
}

.icon {
  font-size: 2em;
  filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5));
}

.name {
  font-size: 0.7em;
  margin-top: 4px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  pointer-events: none;
}

/* Rarity Styles */
.rarity-common { border: 1px solid var(--color-rarity-common); }
.rarity-rare { border: 1px solid var(--color-rarity-rare); box-shadow: 0 0 8px var(--color-rarity-rare); }
.rarity-epic { border: 1px solid var(--color-rarity-epic); box-shadow: 0 0 12px var(--color-rarity-epic); }
.rarity-legendary { 
  border: 1px solid var(--color-rarity-legendary); 
  box-shadow: 0 0 15px var(--color-rarity-legendary), inset 0 0 10px var(--color-rarity-legendary);
  animation: pulse-legendary 2s infinite;
}

@keyframes pulse-legendary {
  0% { box-shadow: 0 0 15px var(--color-rarity-legendary); }
  50% { box-shadow: 0 0 25px var(--color-rarity-legendary); }
  100% { box-shadow: 0 0 15px var(--color-rarity-legendary); }
}
</style>
