import * as constants from '../constants';
import InfiniteScrollModule from './InfiniteScrollModule';
import PostsNewTabModule from './PostsNewTabModule';

const mods = {
    [constants.SETTING_INFINITE_SCROLL]: new InfiniteScrollModule(),
    [constants.SETTING_POSTS_NEW_TAB]:   new PostsNewTabModule()
};

export default mods;
