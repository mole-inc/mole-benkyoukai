//index
import '../styles/main.styl'
import commons from './vendor/commons'
import Smaple from './modules/functions/sample';

window.addEventListener('DOMContentLoaded', ()=>{
  commons(window.innerWidth, window.innerHeight)
  new Smaple()
}, {passive: false});
