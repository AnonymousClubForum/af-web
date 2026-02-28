import {createRouter, createWebHistory} from 'vue-router'
import {useUserStore} from '../stores'

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
        meta: {title: '登录', guest: true}
    },
    {
        path: '/register',
        name: 'RegisterView',
        component: () => import('../views/RegisterView.vue'),
        meta: {title: '注册', guest: true}
    },
    {
        path: '/posts',
        name: 'PostListView',
        component: () => import('../views/PostListView.vue'),
        meta: {title: '帖子列表'}
    },
    {
        path: '/posts/:sectionId',
        name: 'SectionPostListView',
        component: () => import('../views/PostListView.vue'),
        meta: {title: '帖子列表'}
    },
    {
        path: '/post/create',
        name: 'CreatePost',
        component: () => import('../views/PostForm.vue'),
        meta: {title: '发布帖子', requiresAuth: true}
    },
    {
        path: '/post/edit/:id',
        name: 'EditPost',
        component: () => import('../views/PostForm.vue'),
        meta: {title: '编辑帖子', requiresAuth: true}
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
        meta: {title: '个人中心', requiresAuth: true}
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
    const userStore = useUserStore()

    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 没名字论坛` : '没名字论坛'

    // 需要登录的页面
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        next('/login')
        return
    }

    // 已登录用户不能访问登录/注册页面
    if (to.meta.guest && userStore.isLoggedIn) {
        next('/')
        return
    }

    next()
})

export default router
