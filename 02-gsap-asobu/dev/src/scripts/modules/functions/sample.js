import MasterController from "../controllers/MasterController";

class Smaple extends MasterController {
  constructor() {
    super()
    this.initListeners()
  }

  initListeners() {
    super.onSwitchResizeEvent(this.doPcAction.bind(this), this.doMobileAction.bind(this))
    super.mediaQuery().addListener(super.mediaQuery().matches ? this.doPcAction() : this.doMobileAction())
    console.log(super.setSize())
  }

  doPcAction() {
    console.log('pc')
  }

  doMobileAction() {
    console.log('sp')
  }
}

export default Smaple