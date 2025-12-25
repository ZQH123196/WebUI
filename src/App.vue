<script setup lang="ts">
// App.vue now acts as a layout
</script>

<template>
  <div class="app-layout">
    <nav class="nav-bar">
      <router-link to="/">Home</router-link>
      <router-link to="/inventory">Inventory</router-link>
      <router-link to="/compare">Compare DnD</router-link>
      <router-link to="/test-dnd">Test MyTsDnD</router-link>
    </nav>
    <main class="content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
/* 全局样式：确保游戏 UI 背景透明 */
html,
body,
#app {
  background-color: transparent !important;
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100vh;
  width: 100vw;
}

/* 禁止用户选中文字，提升游戏体验 */
* {
  user-select: none;
  -webkit-user-select: none;
}
</style>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
}

.nav-bar {
  padding: 1rem;
  display: flex;
  gap: 20px;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
}

.nav-bar a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-weight: bold;
  transition: color 0.2s;
}

.nav-bar a:hover,
.nav-bar a.router-link-active {
  color: var(--color-primary);
}

.content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
