export {};

declare global {
  interface Window {
    /** Admin password injected by the admin layout for API calls */
    __ADMIN_PW?: string;
  }
}
