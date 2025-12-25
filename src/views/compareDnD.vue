<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Sortable from 'sortablejs';

// --- SortableJS 案例 ---
const sortableRef = ref<HTMLElement | null>(null);
onMounted(() => {
    if (sortableRef.value) {
        new Sortable(sortableRef.value, {
            animation: 150,
            ghostClass: 'sortable-ghost'
        });
    }
});

// --- 纯 JS 实现 (基于 Mouse Events - 兼容 UE WebBrowser) ---
const nativeItems = ref(['Native Item A', 'Native Item B', 'Native Item C', 'Native Item D', 'Native Item E']);
const draggingIdx = ref<number | null>(null);

const startDrag = (event: MouseEvent, index: number) => {
    draggingIdx.value = index;

    const onMouseMove = (e: MouseEvent) => {
        if (draggingIdx.value === null) return;

        // 关键：在 UE 环境中，elementFromPoint 比 DragEvent 稳定得多
        const element = document.elementFromPoint(e.clientX, e.clientY);
        const itemElement = element?.closest('.native-item') as HTMLElement;

        if (itemElement) {
            const targetIdx = parseInt(itemElement.dataset.index || '-1');
            if (targetIdx !== -1 && targetIdx !== draggingIdx.value) {
                // 执行纯 JS 数组交换
                const arr = [...nativeItems.value];
                const temp = arr[draggingIdx.value];
                arr[draggingIdx.value] = arr[targetIdx];
                arr[targetIdx] = temp;
                nativeItems.value = arr;

                // 更新当前拖拽索引
                draggingIdx.value = targetIdx;
            }
        }
    };

    const stopDrag = () => {
        draggingIdx.value = null;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', stopDrag);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopDrag);
};
</script>

<template>
    <div class="home-view">
        <header>
            <h1>Drag & Drop Comparison</h1>
            <p>Comparing SortableJS vs Pure JS (Mouse Events)</p>
        </header>

        <div class="demo-grid">
            <!-- SortableJS 区域 -->
            <div class="demo-card">
                <h2>SortableJS</h2>
                <div ref="sortableRef" class="list-container">
                    <div v-for="i in 5" :key="i" class="item-box sortable-item">
                        Sortable Item {{ i }}
                    </div>
                </div>
            </div>

            <!-- 纯 JS 区域 -->
            <div class="demo-card">
                <h2>纯 JS (Native Mouse Events)</h2>
                <div class="list-container">
                    <div v-for="(item, index) in nativeItems" :key="item" class="item-box native-item"
                        :class="{ 'is-dragging': draggingIdx === index }" :data-index="index"
                        @mousedown="startDrag($event, index)">
                        {{ item }}
                    </div>
                </div>
                <p class="note">注：纯 JS 方案不依赖任何库，直接操作 DOM 事件，在 UE WebBrowser 中兼容性最好。</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.home-view {
    padding: 40px;
    color: white;
    text-align: left;
    max-width: 1000px;
    margin: 0 auto;
}

header {
    margin-bottom: 40px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 20px;
}

h1 {
    margin: 0;
    color: gold;
}

.demo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
}

.demo-card {
    background: rgba(255, 255, 255, 0.03);
    padding: 24px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

h2 {
    font-size: 1.2rem;
    margin-bottom: 20px;
    color: #00bcd4;
}

.list-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.item-box {
    padding: 15px 20px;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 8px;
    cursor: grab;
    user-select: none;
    transition: all 0.2s;
}

.item-box:hover {
    background: #333;
    border-color: #666;
}

/* SortableJS 特有样式 */
.sortable-ghost {
    opacity: 0.4;
    background: rgba(255, 215, 0, 0.2) !important;
    border: 1px dashed gold !important;
}

/* 纯 JS 特有样式 */
.native-item.is-dragging {
    opacity: 0.5;
    background: #1a1a1a;
    border-color: gold;
    transform: scale(0.98);
}

.note {
    margin-top: 20px;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.4;
}
</style>
