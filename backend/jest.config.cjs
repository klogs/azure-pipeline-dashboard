/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@klogs/shared$": "<rootDir>/../shared/src/index.ts",
  },
  testEnvironmentOptions: {
    env: { NODE_ENV: "test" },
  },
};
