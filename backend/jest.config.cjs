{
  "testEnvironment": "node",
  "testMatch": ["**/tests/**/*.test.js"],
  "collectCoverageFrom": ["src/**/*.js"],
  "coveragePathIgnorePatterns": ["/node_modules/"],
  "transform": {
    "^.+\\.js$": "babel-jest"
  },
  "bail": true
}
