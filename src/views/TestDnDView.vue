<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { MyTsDnD } from '../lib/MyTsDnD';

// --- 1. List 测试 ---
const list = ref([
    { id: 1, text: '勇者之剑', color: '#ff4444' },
    { id: 2, text: '魔导书籍', color: '#4444ff' },
    { id: 3, text: '治愈药水', color: '#44ff44' }
]);

const listRef = ref<HTMLElement | null>(null);
let listDnD: MyTsDnD | null = null;

// --- 2. Grid 测试 (模拟背包) ---
const icons = ['⚔️', '🛡️', '🧪', '📜', '💎', '🏹', '🎩', '🍎', '🪙', '🔑'];
const gridItems = ref(Array.from({ length: 15 }, (_, i) => ({
    id: i + 100,
    name: i < 10 ? `Item ${i + 1}` : null,
    icon: i < 10 ? icons[i] : ''
})));

const gridRef = ref<HTMLElement | null>(null);
let gridDnD: MyTsDnD | null = null;

onMounted(() => {
    // 初始化 List 拖拽
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

    // 初始化 Grid 拖拽
    if (gridRef.value) {
        gridDnD = new MyTsDnD(gridRef.value, {
            itemSelector: '.grid-slot',
            draggingClass: 'slot-dragging',
            targetClass: 'slot-target',
            canDrag: (index) => {
                // 只有当格子里有东西时，才允许拖拽
                return !!gridItems.value[index].name;
            },
            onSwap: (oldIdx, newIdx) => {
                const arr = [...gridItems.value];
                [arr[oldIdx], arr[newIdx]] = [arr[newIdx], arr[oldIdx]];
                gridItems.value = arr;
                console.log(`Grid Swap: ${oldIdx} <-> ${newIdx}`);
            }
        });
    }
});

onUnmounted(() => {
    listDnD?.destroy();
    gridDnD?.destroy();
});
</script>

<template>
    <div class="test-container">
        <header>
            <h1>MyTsDnD Library Test</h1>
            <p>Testing List and Grid layouts with <strong>Delayed Swap (on MouseUp)</strong></p>
        </header>

        <div class="test-sections">
            <!-- List Section -->
            <section class="test-section">
                <h2>List Layout</h2>
                <div ref="listRef" class="dnd-list">
                    <div v-for="item in list" :key="item.id" class="dnd-item" :style="{ borderLeftColor: item.color }">
                        <span class="handle">⠿</span>
                        <span class="text">{{ item.text }}</span>
                    </div>
                </div>
            </section>

            <!-- Grid Section -->
            <section class="test-section">
                <h2>Grid Layout (5x3 Inventory)</h2>
                <div ref="gridRef" class="dnd-grid">
                    <div v-for="(slot, index) in gridItems" :key="slot.id" class="grid-slot" :data-index="index">
                        <div v-if="slot.name" class="slot-content">
                            <span class="icon">{{ slot.icon }}</span>
                            <span class="badge">{{ index }}</span>
                        </div>
                    </div>
                </div>
                <p class="hint">注：拖拽到目标位置后<strong>松开鼠标</strong>执行交换</p>
            </section>
        </div>

        <section class="code-preview">
            <h3>Usage:</h3>
            <pre>
// Now supports 'targetClass' for drop-preview
new MyTsDnD(container, {
  itemSelector: '.target-item',
  draggingClass: 'active',
  targetClass: 'drop-preview',
  onSwap: (from, to) => { /* logic */ }
});
            </pre>
        </section>
    </div>
</template>

<style scoped>
.test-container {
    padding: 40px;
    color: white;
    max-width: 1000px;
    margin: 0 auto;
    text-align: left;
}

.test-sections {
    display: flex;
    gap: 40px;
    align-items: flex-start;
}

.test-section {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    padding: 24px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

h1 {
    color: #44ff44;
    margin: 0;
}

h2 {
    color: gold;
    font-size: 1.1rem;
    margin-top: 0;
    margin-bottom: 20px;
}

/* List Styles */
.dnd-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.dnd-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #1e1e1e;
    border: 1px solid #333;
    border-left: 4px solid;
    border-radius: 4px;
    cursor: grab;
    user-select: none;
    transition: all 0.2s;
}

.dnd-item.item-dragging {
    opacity: 0.3;
    background: #000;
    transform: scale(0.95);
    cursor: grabbing;
}

/* 潜在目标落点样式 */
.dnd-item.item-target {
    background: #2a2a2a;
    border-color: gold;
    transform: translateX(10px);
    box-shadow: -5px 0 10px rgba(255, 215, 0, 0.2);
}

.handle {
    margin-right: 12px;
    color: #666;
}

/* Grid Styles */
.dnd-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    background: rgba(0, 0, 0, 0.2);
    padding: 10px;
    border-radius: 8px;
}

.grid-slot {
    aspect-ratio: 1;
    background: #151515;
    border: 1px solid #333;
    border-radius: 4px;
    position: relative;
    cursor: grab;
    transition: all 0.2s;
}

.grid-slot:hover {
    border-color: #555;
    background: #1c1c1c;
}

.slot-content {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    pointer-events: none;
    /* 关键：防止元素内部内容干扰落点探测 */
}

.badge {
    position: absolute;
    bottom: 2px;
    right: 4px;
    font-size: 10px;
    color: #444;
    font-family: monospace;
}

.grid-slot.slot-dragging {
    opacity: 0.3;
    border-color: #555;
    background: #000;
}

/* 网格潜在落点样式 */
.grid-slot.slot-target {
    border-color: gold;
    background: rgba(255, 215, 0, 0.15);
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
    z-index: 10;
}

.hint {
    margin-top: 15px;
    font-size: 0.8rem;
    color: rgba(255, 215, 0, 0.5);
    font-weight: bold;
}

.code-preview {
    margin-top: 40px;
    background: #000;
    padding: 20px;
    border-radius: 8px;
}

pre {
    margin: 0;
    color: #00ff00;
    font-size: 0.85rem;
}

/* 镜像元素样式 (跟随鼠标的那个) */
:global(.dnd-mirror) {
    pointer-events: none !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 15px rgba(255, 215, 0, 0.4);
    transform: scale(1.05);
    /* 稍微放大一点增加质感 */
    background: #252525 !important;
    border-color: gold !important;
    opacity: 0.9 !important;
    z-index: 9999 !important;
}
</style>
