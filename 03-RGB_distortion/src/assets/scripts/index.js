//index
import '../styles/main.styl'
import domContentLoaded from './events/domContentLoaded';
import windowLoaded from './events/windowLoaded';
import { store } from './vendors/store';

domContentLoaded();
windowLoaded();
