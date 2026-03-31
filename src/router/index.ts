import {createRouter, createWebHistory} from 'vue-router'
import {useSectionStore} from '../stores'

const routes = [
    {
        path: '/',
        name: 'HomeView',
        component: () => import('../views/HomeView.vue'),
        meta: {title: '首页'}
    },
    {
        path: '/login',
        name: 'LoginView',
        component: () => import('../views/LoginView.vue'),
        meta: {title: '登录'}
    },
    {
        path: '/register',
        name: 'RegisterView',
        component: () => import('../views/RegisterView.vue'),
        meta: {title: '注册'}
    },
    {
        path: '/posts',
        name: 'PostListView',
        component: () => import('../views/PostListView.vue'),
        meta: {title: '帖子列表', requireSection: true}
    },
    {
        path: '/post/create',
        name: 'CreatePost',
        component: () => import('../views/PostForm.vue'),
        meta: {title: '发布帖子', requireSection: true}
    },
    {
        path: '/post/edit/:id',
        name: 'EditPost',
        component: () => import('../views/PostForm.vue'),
        meta: {title: '编辑帖子'}
    },
    {
        path: '/post/:id',
        name: 'PostDetail',
        component: () => import('../views/PostDetail.vue'),
        meta: {title: '帖子详情'}
    },
    {
        path: '/profile/:id',
        name: 'ProfileView',
        component: () => import('../views/ProfileView.vue'),
        meta: {title: '用户主页'}
    },
    {
        path: '/profile/edit',
        name: 'ProfileEditView',
        component: () => import('../views/ProfileEditView.vue'),
        meta: {title: '个人中心'}
    },
    {
        path: '/notice',
        name: 'NoticeView',
        component: () => import('../views/NoticeView.vue'),
        meta: {title: '通知中心'}
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, _, next) => {
    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 没名字论坛` : '没名字论坛'

    // 不需要分区的页面清空分区信息
    if (!to.meta.requireSection) {
        useSectionStore().id = undefined
    }

    next()
})

export default router
