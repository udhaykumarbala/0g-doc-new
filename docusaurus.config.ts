import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const config: Config = {
  title: '0G Documentation',
  tagline: 'The Next Generation Web3 Infrastructure',
  favicon: 'img/favicon.svg',

  url: 'https://docs.0g.ai',
  baseUrl: '/',
  organizationName: '0G Labs',
  projectName: '0g-docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  stylesheets: [
    {
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
      type: 'text/css',
    },
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-2GB2FSF7Q7',
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ["en"],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        searchBarPosition: 'right',
        docsRouteBasePath: "/",
        searchResultLimits: 8,
        searchResultContextMaxLength: 50,
        hideSearchBarWithNoSearchContext: false,
      },
    ],
    // Add security headers plugin
    require.resolve('./src/plugins/security-headers-plugin'),
  ],

  themeConfig: {
    scripts: [
      {
        innerHTML: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "tr0w896qhb");
        `,
      },
    ],
    navbar: {
      title: 'Documentation',
      logo: {
        alt: '0G Logo',
        src: 'img/0G-Logo-Light.svg',
        srcDark: 'img/0G-Logo-Dark.svg',
      },
      items: [
        {
          type: 'search',
          position: 'right',
        },
        {
          href: 'https://hub.0g.ai',
          position: 'right',
          className: 'header-hubs-link',
          'aria-label': '0G Hub',
          html: '<span class="header-hubs-link-text"><i class="fas fa-globe"></i> 0G Hub</span>',
        },
        {
          href: 'https://github.com/0gfoundation',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
        {
          href: 'https://x.com/0g_labs',
          position: 'right',
          className: 'header-twitter-link',
          'aria-label': 'Twitter profile',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/' },
            { label: 'Run a Node', to: '/run-a-node/overview' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'Discord', href: 'https://discord.gg/0glabs' },
            { label: 'Telegram', href: 'https://t.me/zgcommunity' },
            { label: 'X(Twitter)', href: 'https://x.com/0g_labs' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Blog', href: 'https://0g.ai/blog' },
            { label: 'GitHub', href: 'https://github.com/0gfoundation' },
          ],
        },
      ],
      logo: {
        alt: '0G Labs Logo',
        src: 'img/0G-Logo-Dark.svg',
        href: 'https://0g.ai',
      },
      copyright: `Copyright © ${new Date().getFullYear()} 0G Labs, Built with Docusaurus.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
