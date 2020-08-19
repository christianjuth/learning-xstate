// next.config.js

module.exports = {
  excludeFile: (str) => /\*.{spec,test}.tsx/.test(str)
}
