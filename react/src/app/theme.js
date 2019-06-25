const theme = {
  global: {
    colors: {
      background: '#FFFFFF',
      brand: '#2091eb',
      accent: '#b4ef6b',
      secondary: '#ef6bb4',
    },
    input: {
      border: {
        radius: '24px',
      },
    },
    font: {
      name: 'Rubik',
      family: "'Rubik', Arial, sans-serif",
      face:
        "/* cyrillic */\n@font-face {\n  font-family: 'Rubik';\n  font-style: normal;\n  font-weight: 400;\n  src: local('Rubik'), local('Rubik-Regular'), url(https://fonts.gstatic.com/s/rubik/v7/iJWKBXyIfDnIV7nFrXyi0A.woff2) format('woff2');\n  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;\n}\n/* hebrew */\n@font-face {\n  font-family: 'Rubik';\n  font-style: normal;\n  font-weight: 400;\n  src: local('Rubik'), local('Rubik-Regular'), url(https://fonts.gstatic.com/s/rubik/v7/iJWKBXyIfDnIV7nDrXyi0A.woff2) format('woff2');\n  unicode-range: U+0590-05FF, U+20AA, U+25CC, U+FB1D-FB4F;\n}\n/* latin-ext */\n@font-face {\n  font-family: 'Rubik';\n  font-style: normal;\n  font-weight: 400;\n  src: local('Rubik'), local('Rubik-Regular'), url(https://fonts.gstatic.com/s/rubik/v7/iJWKBXyIfDnIV7nPrXyi0A.woff2) format('woff2');\n  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;\n}\n/* latin */\n@font-face {\n  font-family: 'Rubik';\n  font-style: normal;\n  font-weight: 400;\n  src: local('Rubik'), local('Rubik-Regular'), url(https://fonts.gstatic.com/s/rubik/v7/iJWKBXyIfDnIV7nBrXw.woff2) format('woff2');\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n}\n",
    },
    control: {
      disabled: {
        opacity: 0.5,
      },
    },
  },
  button: {
    border: {
      radius: '24px',
    },
  },
  checkBox: {
    border: {
      radius: '24px',
    },
  },
  layer: {
    border: {
      radius: '24px',
    },
  },
};

export default theme;
