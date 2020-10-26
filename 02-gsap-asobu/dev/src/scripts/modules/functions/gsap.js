import MasterController from "../controllers/MasterController"
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

class Gsap extends MasterController {
  constructor() {
    super()
    this.initListeners()
  }

  initListeners() {
    this.yoyo()
    this.timeline()
    this.fromTo()
    this.getProps()
    this.scroll()
    this.staggerText()
  }

  yoyo() {
    gsap.to('.yoyo-box', {
      duration: 1,
      x: 300,
      yoyo: true,
      repeat: -1
    })
  }

  timeline() {
    const tl = gsap.timeline({
      yoyo: true,
      repeat: -1,

    })
    tl.to('.timeline', {
      duration: 1,
      x: 500,
    }).to('.timeline', {
      duration: 1,
      y: 200
    })
  }

  fromTo() {
    gsap.fromTo('.fromTo', {
      autoAlpha : 0
    },
    {
      duration : 1,
      autoAlpha : 0.5,
      yoyo: true,
      repeat: -1,
    })
  }

  getProps() {
    const x = gsap.getProperty('.getProps', 'x')
    gsap.to('.getProps', {
      duration: 1,
      x: x + 100
    })
  }

  scroll() {
    gsap.registerPlugin(ScrollTrigger)
    const tl = gsap.timeline({
      defaults: {
        duration: 1
      },
      scrollTrigger : {
        markers: true,
        trigger: '.scrollTrigger',
        start: 'top 50%',
        end: 'bottom top',
        toggleActions: "restart none none restart",
        scrub: true,
        pin: true,
      }
    })
    tl.to('.scrollTarget', {
      x: 300
    })
  }

  staggerText() {
    gsap.registerPlugin(ScrollTrigger)
    const tl = gsap.timeline({
      defaults: {
        duration: 1,
      },
      scrollTrigger : {
        markers: true,
        trigger: '.scrollTarget',
        start: 'top 50%',
        end: 'bottom top'
      }
    })

    tl.staggerFromTo('.staggerTextBody', 2,{
      opacity : 0,
      y: 10,
    }, {
      opacity : 1,
      y: 0,
      ease: "expo.inOut"
    }, 0.4)
  }
}

export default Gsap