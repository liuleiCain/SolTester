import {createRouter, createWebHashHistory} from 'vue-router'

export default createRouter({
    history: createWebHashHistory(),
    routes: [{
        path: '/',
        component: () => import('@/layout/layout'),
        children: [
            {
                path: '/deploy',
                // component: () => import('@/views/deploy/deploy'),
                name: 'farm'
            },
            {
                path: '/execute',
                // component: () => import('@/views/execute/execute'),
                name: 'execute'
            }
        ]
    }]
})
