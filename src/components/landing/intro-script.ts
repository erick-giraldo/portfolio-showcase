export const INTRO_KEY = "intro-seen";
export const INTRO_EVENT = "intro:done";

/** Inline script: skips the intro loader for repeat visits or reduced motion before paint. */
export const introBootstrapScript = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem('${INTRO_KEY}')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('${INTRO_KEY}');}else{d.classList.add('is-loading');}}catch(e){d.classList.add('${INTRO_KEY}');}})();`;
