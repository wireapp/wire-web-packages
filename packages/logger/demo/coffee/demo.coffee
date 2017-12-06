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

window.Demo ?= {}

class Demo.DemoClass
  constructor: () ->
    domains_array = ['localhost', 'fakedomain.com']

    options =
      name_length: 40
      steps_length: 3
      domains: domains_array

    @logger = new z.util.Logger 'Test', options
    domains_object =
      'localhost': @logger.levels.LEVEL_1
      'fakedomain.com': @logger.levels.ERROR
    @logger.set_domains domains_object
  # @logger.level = @logger.levels.LEVEL_1
  # @logger.steps_length = 3

  test: () =>
    object =
      first_line: "Hello"
      second_line: "World"

    @logger.log '==='
    @logger.log 'method_name'
    @logger.log 'Callback', @logger.levels.LEVEL_2
    @logger.log 'Callback succeeded', @logger.levels.LEVEL_3
    @logger.log '==='
    @logger.log object
    @logger.log 'Log text.'
    @logger.force_log 'Forced log statement.'
    @logger.log 'Log text with debug information.', @logger.levels.DEBUG, {name: 'Test', message: 'Hello World'}
    @logger.log 'Log with priority.', @logger.levels.WARN
    @logger.log 'Log text with object.', object
    # @logger.log 'Log text with two objects.', object, object, @logger.levels.ERROR
    @logger.log @logger.levels.LEVEL_2, 'Log text with two objects and log level.', object, object
    @logger.log 'Log text with one object and log level.', @logger.levels.LEVEL_2, object
    @logger.log 'Log text with one object and log level.', object, @logger.levels.LEVEL_2

demo = new Demo.DemoClass()
demo.test();
