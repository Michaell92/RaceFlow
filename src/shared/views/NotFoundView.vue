<template>
  <div class="not-found">
    <q-icon name="search_off" size="4rem" color="grey-5" />
    <h1 class="not-found__title">404</h1>
    <p class="not-found__text">Page not found</p>
    <q-btn label="Go Home" color="primary" no-caps unelevated to="/" />
  </div>
</template>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 0.5rem;

  &__title {
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    color: var(--q-grey-7);
  }

  &__text {
    font-size: 1.125rem;
    color: var(--q-grey-6);
    margin: 0 0 1rem;
  }
}
</style>
