<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { MyTsDnD } from '../lib/MyTsDnD';

// --- Shared List 测试 ---
const groupA = ref([
    { id: 10, text: '物品 A-1' },
    { id: 11, text: '物品 A-2' },
    { id: 12, text: '物品 A-3' }
]);

const groupB = ref([
    { id: 20, text: '物品 B-1' },
    { id: 21, text: '物品 B-2' }
]);

const refA = ref<HTMLElement | null>(null);
const refB = ref<HTMLElement | null>(null);
let dndA: MyTsDnD | null = null;
let dndB: MyTsDnD | null = null;

// --- List 测试 ---
const list = ref([
    { id: 1, text: '勇者之剑', color: '#ff4444' },
    { id: 2, text: '魔导书籍', color: '#4444ff' },
    { id: 3, text: '治愈药水', color: '#44ff44' }
]);
const listRef = ref<HTMLElement | null>(null);
let listDnD: MyTsDnD | null = null;

// --- Grid 测试 ---
const icons = ['⚔️', '🛡️', '🧪', '📜', '💎', '🏹', '🎩', '🍎', '🪙', '🔑'];
const gridItems = ref(Array.from({ length: 15 }, (_, i) => ({
    id: i + 100,
    name: i < 10 ? `Item ${i + 1}` : null,
    icon: i < 10 ? icons[i] : ''
})));
const gridRef = ref<HTMLElement | null>(null);
let gridDnD: MyTsDnD | null = null;

onMounted(() => {
    // Shared List A
    if (refA.value) {
        dndA = new MyTsDnD(refA.value, {
            itemSelector: '.shared-item',
            group: 'shared-group',
            draggingClass: 'item-dragging',
            targetClass: 'item-target',
            onSwap: (oldIdx, newIdx) => {
                const arr = [...groupA.value];
                [arr[oldIdx], arr[newIdx]] = [arr[newIdx], arr[oldIdx]];
                groupA.value = arr;
            },
            onAdd: (oldIdx, newIdx, fromContainer) => {
                // 如果是从 B 拖过来的
                if (fromContainer === refB.value) {
                    const item = groupB.value.splice(oldIdx, 1)[0];
                    groupA.value.splice(newIdx, 0, item);
                }
            }
        });
    }

    // Shared List B
    if (refB.value) {
        dndB = new MyTsDnD(refB.value, {
            itemSelector: '.shared-item',
            group: 'shared-group',
            draggingClass: 'item-dragging',
            targetClass: 'item-target',
            onSwap: (oldIdx, newIdx) => {
                const arr = [...groupB.value];
                [arr[oldIdx], arr[newIdx]] = [arr[newIdx], arr[oldIdx]];
                groupB.value = arr;
            },
            onAdd: (oldIdx, newIdx, fromContainer) => {
                // 如果是从 A 拖过来的
                if (fromContainer === refA.value) {
                    const item = groupA.value.splice(oldIdx, 1)[0];
                    groupB.value.splice(newIdx, 0, item);
                }
            }
        });
    }

    // List
    if (listRef.value) {
        listDnD = new MyTsDnD(listRef.value, {
            itemSelector: '.dnd-item',
            draggingClass: 'item-dragging',
            targetClass: 'item-target',
            onSwap: (oldIdx, newIdx) => {
                const arr = [...list.value];
                [arr[oldIdx], arr[newIdx]] = [arr[newIdx], arr[oldIdx]];
                list.value = arr;
            }
        });
    }

    // Grid
    if (gridRef.value) {
        gridDnD = new MyTsDnD(gridRef.value, {
            itemSelector: '.grid-slot',
            draggingClass: 'slot-dragging',
            targetClass: 'slot-target',
            canDrag: (index) => !!gridItems.value[index].name,
            onSwap: (oldIdx, newIdx) => {
                const arr = [...gridItems.value];
                [arr[oldIdx], arr[newIdx]] = [arr[newIdx], arr[oldIdx]];
                gridItems.value = arr;
            }
        });
    }
});

onUnmounted(() => {
    dndA?.destroy();
    dndB?.destroy();
    listDnD?.destroy();
    gridDnD?.destroy();
});
</script>

<template>
    <div class="test-container">
        <h1>MyTsDnD Advanced Test</h1>

        <!-- 1. Shared List Test -->
        <section class="test-section">
            <h2>Shared List Layout (跨容器拖拽)</h2>
            <div class="shared-container">
                <div class="column">
                    <h3>Group A</h3>
                    <div ref="refA" class="shared-list">
                        <div v-for="item in groupA" :key="item.id" class="shared-item">
                            {{ item.text }}
                        </div>
                    </div>
                </div>
                <div class="column">
                    <h3>Group B</h3>
                    <div ref="refB" class="shared-list">
                        <div v-for="item in groupB" :key="item.id" class="shared-item">
                            {{ item.text }}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="test-sections">
            <!-- 2. List Layout -->
            <section class="test-section">
                <h2>List Layout (单容器)</h2>
                <div ref="listRef" class="dnd-list">
                    <div v-for="item in list" :key="item.id" class="dnd-item" :style="{ borderLeftColor: item.color }">
                        <span class="handle">⠿</span>
                        {{ item.text }}
                    </div>
                </div>
            </section>

            <!-- 3. Grid Layout -->
            <section class="test-section">
                <h2>Grid Layout (背包模拟)</h2>
                <div ref="gridRef" class="dnd-grid">
                    <div v-for="(slot, index) in gridItems" :key="slot.id" class="grid-slot" :data-index="index">
                        <div v-if="slot.name" class="slot-content">
                            <span>{{ slot.icon }}</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
.test-container {
    padding: 40px;
    color: white;
    max-width: 1200px;
    margin: 0 auto;
    text-align: left;
}

.test-section {
    background: rgba(255, 255, 255, 0.05);
    padding: 24px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 30px;
}

h1 {
    color: #44ff44;
    margin-bottom: 40px;
}

h2 {
    color: gold;
    font-size: 1.1rem;
    margin-top: 0;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

h3 {
    font-size: 0.9rem;
    color: #888;
    margin-bottom: 10px;
}

.test-sections {
    display: flex;
    gap: 30px;
}

/* Shared List Styles */
.shared-container {
    display: flex;
    gap: 20px;
}

.column {
    flex: 1;
}

.shared-list {
    min-height: 150px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px dashed #444;
    padding: 10px;
    border-radius: 8px;
}

.shared-item {
    background: #2a2a2a;
    padding: 10px 15px;
    margin-bottom: 8px;
    border: 1px solid #444;
    border-radius: 4px;
    cursor: grab;
}

.shared-item.drop-target {
    border-color: gold;
    background: #333;
    transform: scale(1.02);
}

.shared-list.drop-target {
    border-color: #44ff44;
    background: rgba(68, 255, 68, 0.05);
}

/* Common DND Styles */
.item-dragging {
    opacity: 0.3 !important;
}

:global(.dnd-mirror) {
    pointer-events: none !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    background: #333 !important;
    border: 1px solid gold !important;
    z-index: 10000;
}

/* List/Grid Styles (Reuse) */
.dnd-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.dnd-item {
    padding: 12px;
    background: #1e1e1e;
    border: 1px solid #333;
    border-left: 4px solid;
    border-radius: 4px;
    cursor: grab;
}

.item-target {
    border-color: gold;
    transform: translateX(5px);
}

.dnd-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
}

.grid-slot {
    aspect-ratio: 1;
    background: #151515;
    border: 1px solid #333;
    border-radius: 4px;
    cursor: grab;
}

.slot-content {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    pointer-events: none;
}

.slot-target {
    border-color: gold;
    background: rgba(255, 215, 0, 0.1);
}
</style>
