import * as constants from '../constants';
import InfiniteScrollModule from './InfiniteScrollModule';
import PostsNewTabModule from './PostsNewTabModule';
import BiggerButtonsModule from './BiggerButtonsModule';

const mods = {
  [constants.SETTING_INFINITE_SCROLL]: InfiniteScrollModule,
  [constants.SETTING_POSTS_NEW_TAB]:   PostsNewTabModule,
  [constants.SETTING_BIGGER_BUTTONS]:  BiggerButtonsModule
};

export default mods;
