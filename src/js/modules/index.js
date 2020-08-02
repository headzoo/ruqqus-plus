import * as constants from '../constants';
import InfiniteScrollModule from './InfiniteScrollModule';
import PostsNewTabModule from './PostsNewTabModule';
import BiggerButtonsModule from './BiggerButtonsModule';

const mods = {
  [constants.SETTING_INFINITE_SCROLL]: new InfiniteScrollModule(),
  [constants.SETTING_POSTS_NEW_TAB]:   new PostsNewTabModule(),
  [constants.SETTING_BIGGER_BUTTONS]:  new BiggerButtonsModule()
};

export default mods;
