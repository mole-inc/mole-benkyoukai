//DOMContentLoaded
import entry from '../vendors/entry';

export default ()=> {
  window.addEventListener('DOMContentLoaded', ()=>{
    entry();
  }, {
    once: true,
    passive: false,
  });
}
