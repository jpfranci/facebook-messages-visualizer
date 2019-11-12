module.exports = [
    {
      module: {
        rules: [{
          test: /node_modules[\/\\](iconv-lite)[\/\\].+/,
          resolve: {
            aliasFields: ['main']
          }
        }]
      }
    }
  ];