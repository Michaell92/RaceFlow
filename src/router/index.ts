import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/modules/Race/views/RaceLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('@/modules/Race/views/RaceView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/shared/views/NotFoundView.vue'),
    },
  ],
})

export default router
