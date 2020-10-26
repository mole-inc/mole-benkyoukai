//entry
import top from "../pages/top";
import { store } from "./store";

export default ()=>{
  switch(store.pageId) {
    case 'top':
      top();
      break;
    default:
      break;
  }
}