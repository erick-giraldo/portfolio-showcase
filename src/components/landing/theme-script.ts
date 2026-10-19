export const THEME_STORAGE_KEY = "cv-theme";

/** Inline script: applies the stored theme before paint to avoid a flash. */
export const themeBootstrapScript = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var d=s==='dark';document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
