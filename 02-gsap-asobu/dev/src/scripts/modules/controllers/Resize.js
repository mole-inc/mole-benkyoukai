//resize
export default (fn)=> {
  window.addEventListener('resize', fn, {passive: true});
}
