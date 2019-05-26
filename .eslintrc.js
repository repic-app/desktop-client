module.exports = {
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "plugins": ["react"],
  "rules": {
    "react/jsx-uses-react": [1],
    "react/jsx-uses-vars": [2],
    "linebreak-style": 0,
    "indent": ["error", 2],
    "no-console": 0,
    "linebreak-style": 0,
    "quotes": ["error", "single"],
    "semi": ["error", "never"],
    "no-unused-vars": 0
  }
};