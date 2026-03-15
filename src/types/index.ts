// Shared type definitions - business logic types will be added in future tasks
export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  links: {
    twitter: string;
    github: string;
  };
  nav: readonly { title: string; href: string }[];
};
