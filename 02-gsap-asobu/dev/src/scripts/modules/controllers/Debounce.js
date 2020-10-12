//debounce

export default (fn, interval)=>{
  let debounce = null;
  return()=>{
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      fn();
    }, interval);
  };
}
