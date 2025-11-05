/// <reference types="vite/client" />

// CSS Modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Environment variables
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_INSTAGRAM_URL: string;
  readonly VITE_FACEBOOK_URL: string;
  readonly VITE_SPOTIFY_URL: string;
  readonly VITE_YOUTUBE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
