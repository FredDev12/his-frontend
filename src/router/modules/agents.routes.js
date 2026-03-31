/**
 * Agents module routes
 */

export const agentsRoutes = [
  {
    path: 'agents',
    name: 'agents',
    children: [
      {
        path: 'search',
        name: 'agentSearch',
        component: () => import('../../modules/agents/pages/AgentSearchPage.vue'),
      },
    ],
  },
]
