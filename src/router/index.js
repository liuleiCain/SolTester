import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
const routes = [{
	path: '/',
	component: () => import('@/layout/layout'),
	children: [{
		path: '',
		component: () => import('@/pages/abi'),
		name: 'Abi'
	}]
}]
export default new Router({
	routes
})
