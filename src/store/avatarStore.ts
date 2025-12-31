import {defineStore} from 'pinia';

export const useAvatarStore = defineStore('avatar', {
    state: () => ({
        avatarUrl: '/defaultAvatar.png',
    }),
    actions: {
        setAvatarUrl(url: string) {
            this.avatarUrl = url;
        },
        removeAvatarUrl() {
            this.avatarUrl = '/defaultAvatar.png';
        }
    },
});