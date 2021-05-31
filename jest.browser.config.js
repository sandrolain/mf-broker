const { compilerOptions } = require("./tsconfig.json");

Object.assign(compilerOptions, {
  inlineSourceMap: true
});

module.exports = {
  preset: "jest-puppeteer",
  setupFilesAfterEnv: ["expect-puppeteer"],
  roots: ["./src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/**/*.spec.ts",
    "!<rootDir>/dist/**/*.*"
  ],
  coverageDirectory: "./coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],
  testRegex: "browser.spec.ts$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // testEnvironment: "node",
  globals: {
    "ts-jest": {
      tsConfig: compilerOptions
    }
  }
};
