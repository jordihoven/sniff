<template>
  <nav>
    <router-link to="/"><LucideSearch class="icon"></LucideSearch></router-link>
    <router-link to="/torrent"><LucideSparkles class="icon"></LucideSparkles></router-link>
  </nav>
</template>

<style scoped lang="css">
nav {
  position: fixed;
  display: flex;
  gap: 4px;
  padding: var(--xxs-spacing);
  background-color: var(--bg-main);
  border-radius: var(--radius);
  border: var(--border);
  color: var(--text-secondary);
  bottom: var(--s-spacing);
  left: 50%;
  transform: translateX(-50%);
  z-index: 69;
}

nav a {
  display: flex;
  padding: var(--xs-spacing);
  border-radius: var(--radius);
  transition: var(--transition);
}
nav a:hover {
  background-color: var(--bg-primary);
}
</style>
