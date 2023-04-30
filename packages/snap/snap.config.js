module.exports = {
  cliOptions: {
    src: './src/index.ts',
    port: 8080,
    transpilationMode: 'localOnly',
  },
  bundlerCustomizer: (bundler) => {
    bundler.transform('brfs');
  },
};
