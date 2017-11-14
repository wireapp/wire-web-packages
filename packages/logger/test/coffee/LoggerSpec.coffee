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

describe 'Logger tests', ->
  window.console.log = ->
  logger = new z.util.Logger 'TestLogger'

  it 'can be turned off', ->
    expect('A').toBe('A')
    logger.level = logger.levels.OFF
    code = logger.log 'Log text.'
    expect(code).toBe -1

  it 'has a default log level of "1"', ->
    logger.level = logger.levels.LEVEL_2
    code = logger.log 'Log text.'
    expect(code).toBe 0

  it 'supports setting a log level', ->
    logger.level = logger.levels.LEVEL_2
    code = logger.log 'Log text.', logger.levels.LEVEL_2
    expect(code).toBe 0

  it 'doesn\'t care about the parameter order of the log level', ->
    logger.level = logger.levels.LEVEL_2
    code = logger.log logger.levels.LEVEL_2, 'Log text.'
    expect(code).toBe 0

  it 'supports aliases for the different log levels', ->
    debug = logger.debug 'Log debug text.'
    expect(debug).toBe 0

    info = logger.info 'Log info text.'
    expect(info).toBe 0

    warn = logger.warn 'Log warn text.'
    expect(warn).toBe 0

    error = logger.error 'Log error text.'
    expect(error).toBe 0
