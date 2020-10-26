//store

export namespace store {
  /*
  //without scrollBar value
  export let windowWidth: number = document.documentElement.clientWidth
  export let windowHeight: number = document.documentElement.clientHeight
  */
  export let windowWidth: number = window.innerWidth;
  export let windowHeight: number = window.innerHeight;

  export let laptop: boolean = window.matchMedia('(min-width: 749px)').matches;
  export let touch: boolean = ('ontouchend' in document) && ('orientation' in window);

  export let container: HTMLElement = document.querySelector('.container');
  export let pageId: string = container.getAttribute('data-pageId');

  export let requestId = null;
}
