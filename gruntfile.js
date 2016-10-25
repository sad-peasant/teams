module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    watch: {
      scripts: {
        files: ['lib/**/*.js', 'test/**/*.js'],
        tasks: ['mochaTest']
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'results.txt',
          quiet: false,
          clearRequireCache: false,
          noFail: false
        },
        src: ['test/**/*.test.js']
      }
    }
  });

  grunt.registerTask('test', 'mochaTest');
  grunt.registerTask('dev', 'watch');
};