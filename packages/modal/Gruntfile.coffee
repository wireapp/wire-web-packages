#
# Wire
# Copyright (C) 2016 Wire Swiss GmbH
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
  require('load-grunt-tasks') grunt
  path = require 'path'

  config =
    connect_port: 5432
    livereload_port: 54321
    app: 'app'
    dist: 'dist'
    prod: 'prod'
    js: 'js'
    test: 'test'
    coffee: 'coffee'

  grunt.initConfig
    config: config

    coffee:
      dist:
        expand: true
        cwd: config.app
        src: ['**/*.coffee']
        dest: config.dist
        ext: '.js'

      test:
        expand: true
        cwd: path.join config.test, config.coffee
        dest: path.join config.test, config.js
        src: ['**/*.coffee']
        ext: '.js'


    less:
      dist:
        options:
          paths: ['<%= config.app %>/style']
        files:
          '<%= config.dist %>/style/main.css': '<%= config.app %>/style/main.less'


    copy:
      dist:
        expand: true
        cwd: config.app
        src: ['**/*.html']
        dest: config.dist


    jasmine:
      dist:
        src: '<%= config.dist %>/**/*.js'
        options:
          specs: '<%= config.test %>/<%= config.js %>/*_spec.js'


    watch:
      app:
        options:
          livereload: config.livereload_port
        files: '<%= config.app %>/**/*.{coffee,less}'
        tasks: ['coffee:dist', 'less:dist']

      static:
        options:
          livereload: config.livereload_port
        files: ['<%= config.app %>/*.html', '<%= config.app %>/**/*.html']
        tasks: ['copy:dist']

      test:
        options:
          livereload: config.livereload_port
        files: '<%= config.test %>/**/*.coffee'
        tasks: ['coffee:test', 'jasmine']


    open:
      dev:
        path: "http://localhost:#{config.connect_port}/#{config.dist}/"


    connect:
      server:
        options:
          port: config.connect_port
          hostname: '*'
          base: '.'


    clean:
      dist: config.dist
      test: path.join config.test, config.js


  grunt.registerTask 'dist', ['clean:dist', 'coffee:dist', 'less:dist', 'copy:dist']
  grunt.registerTask 'test', ['dist', 'clean:test', 'coffee:test', 'jasmine']

  grunt.registerTask 'default', ['dist', 'connect', 'open', 'watch']
