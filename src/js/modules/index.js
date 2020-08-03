import * as constants from '../utils/constants';
import InfiniteScrollModule from './InfiniteScrollModule';
import PostsNewTabModule from './PostsNewTabModule';
import BiggerButtonsModule from './BiggerButtonsModule';
import UserInfoModule from './UserInfoModule';

const mods = {
  [constants.MOD_INFINITE_SCROLL]: InfiniteScrollModule,
  [constants.MOD_POSTS_NEW_TAB]:   PostsNewTabModule,
  [constants.MOD_BIGGER_BUTTONS]:  BiggerButtonsModule,
  [constants.MOD_USER_INFO]:       UserInfoModule
};

export default mods;
