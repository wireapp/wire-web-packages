#
# Wire
# Copyright (C) 2017 Wire Swiss GmbH
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see http://www.gnu.org/licenses/.
#

module.exports = (grunt) ->
  require('load-grunt-tasks') grunt,
    pattern: [
      'grunt-*'
      '!grunt-template-jasmine-istanbul'
    ]

  grunt.initConfig
    # Configuration
    pkg: grunt.file.readJSON 'package.json'
    livereload_port: 35729
    server_port: 8000
    # Modules
    clean: require './config/clean'
    coffee: require './config/coffee'
    connect: require './config/connect'
    copy: require './config/copy'
    jasmine: require './config/jasmine'
    open: require './config/open'
    uglify: require './config/uglify'
    watch: require './config/watch'

  # Common tasks
  grunt.registerTask 'default', 'dev'
  grunt.registerTask 'test', 'dist'

  # App specific tasks
  grunt.registerTask 'dev',
    ['connect:server', 'dist', 'coffee:demo', 'open:demo', 'watch']

  grunt.registerTask 'dist',
    ['clean:dist', 'copy:dist', 'coffee:dist', 'uglify:dist', 'test']

  grunt.registerTask 'test',
    ['clean:test_js', 'coffee:test', 'jasmine:dist']
