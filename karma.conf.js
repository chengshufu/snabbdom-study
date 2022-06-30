const ci = !!process.env.CI;
const watch = !!process.env.WATCH;
const live = !!process.env.LIVE;
const es5 = !!process.env.ES5;
const ip = undefined;

const browsers = watch
  ? ["Chrome", "Firefox"]
  : ["ChromeHeadless", "FirefoxHeadless"];

module.exports = function (config) {
  config.set({
    basePath: ".",
    frameworks: ["mocha", "karma-typescript"],
    // list of files / patterns to load in the browser
    files: process.env.FILES_PATTERN.split(",")
      .map((p) => ({ pattern: p }))
      .concat({ pattern: "src/**/*.ts" }),
    preprocessors: {
      "**/*.ts": "karma-typescript",
      "**/*.tsx": "karma-typescript",
    },
    plugins: [
      "karma-mocha",
      "karma-typescript",
      "karma-mocha-reporter",
      "karma-chrome-launcher",
      "karma-firefox-launcher",
    ],
    hostname: ci ? ip : "localhost",
    karmaTypescriptConfig: {
      compilerOptions: {
        ...require("./tsconfig.json").compilerOptions,
        ...require("./test/tsconfig.json").compilerOptions,
        sourceMap: false,
        inlineSourceMap: true,
        target: es5 ? "es5" : "es6",
      },
      bundlerOptions: {
        sourceMap: true,
      },
      include: process.env.FILES_PATTERN.split(",").concat("src/**/*.ts"),
    },

    client: {
      captureConsole: true,
    },

    reporters: ["karma-typescript", "mocha"],
    mochaReporter: {
      showDiff: true,
    },
    port: 9876,
    colors: true,
    autoWatch: true,
    browsers: browsers,
    singleRun: !watch && !live,
    concurrency: Infinity,
  });
};
