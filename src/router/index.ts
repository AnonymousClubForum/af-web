import {createRouter, createWebHashHistory} from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: 'home',
            meta: {
                title: 'Anonymous Forum',
            },
            path: '/',
            component: () => import('../views/AppContainer.vue'),
            redirect: {name: 'posts'},
            children: [
                {
                    name: 'posts',
                    meta: {
                        title: 'Anonymous Forum',
                    },
                    path: 'posts',
                    component: () => import('../views/post/PostsView.vue'),
                },
                {
                    name: 'post',
                    meta: {
                        title: '帖子详情',
                    },
                    path: 'post/:id',
                    component: () => import('../views/post/PostDetail.vue'),
                },
                {
                    name: 'profile',
                    meta: {
                        title: '个人资料',
                    },
                    path: 'profile/:id',
                    component: () => import('../views/user/ProfileView.vue'),
                    props: true,   // 允许通过 props 传递路由参数
                },
                {
                    name: 'newPost',
                    meta: {
                        title: '发布帖子',
                    },
                    path: 'newPost',
                    component: () => import('../views/post/NewPost.vue'),
                },
                {
                    name: 'auth',
                    meta: {
                        title: '用户认证',
                    },
                    path: 'auth',
                    component: () => import('../views/user/AuthView.vue'),
                },
                {
                    name: 'password',
                    meta: {
                        title: '修改密码',
                    },
                    path: 'password',
                    component: () => import('../views/user/ResetPassword.vue'),
                },
                {
                    name: 'gender',
                    meta: {
                        title: '修改性别',
                    },
                    path: 'gender',
                    component: () => import('../views/user/ResetGender.vue'),
                },
                {
                    name: 'search',
                    meta: {
                        title: '搜索结果',
                    },
                    path: 'search/:query',
                    component: () => import('../views/post/SearchResult.vue'),
                },
            ],
        },
    ],
})

router.beforeEach((to, _, next) => {
    const title = to.meta.title as string;
    document.title = title ? title : 'Anonymous Forum';
    next();
});

export default router