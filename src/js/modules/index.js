import * as constants from '../constants';
import InfiniteScrollModule from './InfiniteScrollModule';
import PostsNewTabModule from './PostsNewTabModule';
import BiggerButtonsModule from './BiggerButtonsModule';

const mods = {
  [constants.MOD_INFINITE_SCROLL]:    InfiniteScrollModule,
  [constants.MOD_POSTS_NEW_TAB]:      PostsNewTabModule,
  [constants.MOD_BIGGER_BUTTONS]: BiggerButtonsModule
};

export default mods;
