/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: '7geese',
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/image.jpg'.
    image: 'https://40bgqrkkuuk2hpdzn5aqyy13-wpengine.netdna-ssl.com/wp-content/themes/7g/style/img/logo-full-grey.png',
    infoLink: 'https://www.7geese.com',
    pinned: true,
  },
];

const siteConfig = {
  title: 'basset',
  tagline: 'Visual regression testing platform',
  url: 'https://basset.io',
  baseUrl: '/',
  cname: 'basset.io',
  projectName: 'basset',
  organizationName: 'basset',
  headerLinks: [
    { doc: 'getting-started', label: 'Docs' },
    { page: 'api/', label: 'API' },
    { blog: true, label: 'Blog' },
    { href: "https://github.com/basset/basset", label: "GitHub" },
  ],
  headerIcon: 'img/favicon.ico',
  footerIcon: 'img/favicon.ico',
  favicon: 'img/favicon.ico',
  users,
  /* Colors for website */
  colors: {
    primaryColor: '#2190eb',
    secondaryColor: '#b4ef6b',
  },

  /* Custom fonts for website */
  fonts: {
    myFont: [
    "Rubik", "Arial", "sans-serif",
    ],
    myOtherFont: [
      "Rubik", "Arial", "sans-serif",
      ],
  },
  usePrism: ['json', 'http', 'typescript'],
  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Basest`,

  highlight: {
    theme: 'atelier-sulphurpool-light',
  },

  scripts: ['https://buttons.github.io/buttons.js'],

  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/basset.svg',
  twitterImage: 'img/basset.svg',

  // Show documentation's last update time.
  enableUpdateTime: false,

  repoUrl: 'https://github.com/basset/basset',

  wrapPagesHTML: true,
};

module.exports = siteConfig;
