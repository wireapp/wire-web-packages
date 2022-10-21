module.exports = {
    clearMocks: true,
    testMatch: ["**/?(*.)+(spec|test).+(ts|tsx)", "test/**/*.+(ts|tsx)",],
    transform: {
        "^.+\\.(ts|tsx)$": "@swc/jest"
    },
    testEnvironment: "jsdom",
}