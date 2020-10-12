import debounce from './Debounce'
import resize from './Resize'

export default class LpLpMasterController {
  constructor() {
    this.WINDOW_WIDTH = window.innerWidth
    this.WINDOW_HEIGHT = window.innerHeight

    this.MEDIA = matchMedia('(min-width: 769px)')
    this.TOUCH = ('ontouchend' in document) && ('orientation' in window)
  }

  setSize() {
    return [this.WINDOW_WIDTH, this.WINDOW_HEIGHT]
  }

  mediaQuery() {
    return this.MEDIA
  }

  onSwitchResizeEvent(pc, mobile) {
    const resizeFunction = debounce(() => {
      this.WINDOW_WIDTH = window.innerWidth
      this.WINDOW_HEIGHT = window.innerHeight
      this.MEDIA.matches ? pc() : mobile()
    }, 100);
    new resize(resizeFunction)
  }
}