<template>
  <button>
    <LucideSearch class="icon"></LucideSearch>
    Search movies
  </button>
</template>

<style scoped lang="css">
button {
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

  display: flex;
  padding: var(--xs-spacing);
  border-radius: var(--radius);
  transition: var(--transition);
}
button:hover {
  background-color: var(--bg-primary);
}
</style>
