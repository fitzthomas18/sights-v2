import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "SIGHTS",
  description: "A teleoperative robot control interface",
  base: "/docs/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },

    lastUpdated: {
      text: "Last updated",
    },

    logo: { src: '/icon.png' },

    nav: [
      { text: 'S.A.R.T Website', link: 'https://sfxrescue.com' },
      { text: 'Legacy Docs', link: 'https://sights.js.org' }
    ],

    head: [
      ['link', { rel: 'icon', href: '/icon.ico' }],
      ['link', { rel: 'stylesheet', type: 'text/css', href: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css' }]
    ],

    sidebar: [
      { text: 'What is SIGHTS?', link: '/' },
      {
        text: 'Install',
        collapsed: false,
        items: [
          {
            text: '',
            base: '/install/',
            items: [
              { text: 'Installer', link: '/installer' },
              { text: 'Manual', link: '/manual' },
              { text: 'NixOS', link: '/nixos' },
            ]
          }
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sightsdev/sights-lite' }
    ]
  }
})
