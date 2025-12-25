<template>
    <div class="coord-viewer">
        <!-- Corners -->
        <div class="corner top-left">(0, 0)</div>
        <div class="corner top-right">(100%, 0)</div>
        <div class="corner bottom-left">(0, 100%)</div>
        <div class="corner bottom-right">(100%, 100%)</div>

        <!-- Center Info -->
        <div class="center-box">
            <h1>Frontiers Adventurers</h1>
            <p>UE WebUI Debug Mode</p>
            <div class="info-badge">Resolution: {{ width }} x {{ height }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const width = ref(window.innerWidth);
const height = ref(window.innerHeight);

const updateSize = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
};

onMounted(() => {
    window.addEventListener('resize', updateSize);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateSize);
});
</script>

<style scoped>
.coord-viewer {
    position: relative;
    width: 100%;
    height: 100%;
    background: #050505;
    color: #00ff00;
    /* Debug Green */
    font-family: 'Courier New', Courier, monospace;
}

.corner {
    position: absolute;
    padding: 10px;
    background: rgba(0, 255, 0, 0.1);
    border: 1px solid #00ff00;
    font-size: 14px;
}

.top-left {
    top: 0;
    left: 0;
}

.top-right {
    top: 0;
    right: 0;
}

.bottom-left {
    bottom: 0;
    left: 0;
}

.bottom-right {
    bottom: 0;
    right: 0;
}

.center-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    border: 1px dashed #333;
    padding: 40px;
}

h1 {
    margin: 0;
    color: gold;
    letter-spacing: 4px;
}

.info-badge {
    margin-top: 20px;
    background: #222;
    padding: 8px 16px;
    border-radius: 4px;
    display: inline-block;
    color: white;
}
</style>