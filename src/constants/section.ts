import type {Section} from '../types';

/**
 * 帖子分区列表
 */
export const SECTION_DICT: { [key: number]: Section } = {
    0: {
        id: 0,
        name: '综合',
        desc: '综合频道，畅所欲言',
    },
    1: {
        id: 1,
        name: '游戏',
        desc: '讨论游戏相关内容',
    },
    2: {
        id: 2,
        name: '水',
        desc: '尽情分享无意义内容',
    },
    3: {
        id: 3,
        name: '求助',
        desc: '提出遇到的问题，寻求大家帮助',
    },
    4: {
        id: 4,
        name: '资源推荐',
        desc: '推荐实用资源、工具等',
    }
};