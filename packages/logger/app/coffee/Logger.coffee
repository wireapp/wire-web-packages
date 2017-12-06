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

window.z ?= {}
z.util ?= {}

to_array = (args) ->
  return Array.prototype.slice.call args

class z.util.Logger
  LOG_ON_DEBUG: 'z.util.Logger::LOG_ON_DEBUG'

  ###
  @param name [String] the name that will be written in the beginning of each log message
  @param options [Object] the logger options
  @option options [Integer] color the log message color (ex. 'Orange')
  @option options [Array<String>, Object<String, LogLevel>] domains an array of domains where logging should be turned on or an object defining log levels for domains
  @option options [Boolean] high_precision weather log messages should show milliseconds or not
  @option options [Function] level a function which returns the number of the log level
  @option options [Boolean] log_time weather the time should appear in log messages or not
  @option options [Integer] name_length the minimum length of the logger's name (will be filled up with spaces)
  @option options [Integer] steps_length the minimum length of the log count (ex. 3 for '003')
  ###
  constructor: (@name, @options = {}) ->

    ###########################
    # Properties
    ###########################
    @color = @options.color or undefined
    @domain = window.location.hostname
    @domains = @options.domains or undefined
    @high_precision = @options.high_precision or true
    @level = @options.level or @levels.LEVEL_1
    @log_time = @options.log_time or true
    @logging_name = @name or arguments.callee.caller.name
    @name_length = @options.name_length or undefined
    @steps_length = @options.steps_length or 3

    ###########################
    # Helper functions
    ###########################
    @_pad_number = (number, width) ->
      width -= (number.toString().length - /\./.test(number))
      return new Array(width + 1).join('0') + number  if width > 0
      number + ''

    @_pad_string = (string, length) ->
      if length is undefined
        return string
      else
        padding = new Array(Math.max(length - string.length + 1, 0)).join ' '
        return string + padding

    @_check_log_permission = =>
      return true if @domains is undefined

      if @domains.constructor is Array
        for domain in @domains
          return true if window.location.hostname.indexOf(domain) > -1
      else if typeof @domains is 'object'
        for domain, domain_log_level of @domains
          if window.location.hostname.indexOf(domain) > -1
            @level = domain_log_level
            return true

      return false

    ###########################
    # Initialization
    ###########################
    @log_on = @_check_log_permission()
    @logging_name = @_pad_string @name, @name_length
    @steps = 0
    @_reset()

    amplify.subscribe @LOG_ON_DEBUG, @, @set_log_on

  levels:
    OFF: -> 0
    LEVEL_1: -> 300 # FINEST (lowest value)
    LEVEL_2: -> 400 # FINER
    LEVEL_3: -> 500 # FINE
    DEBUG: -> 700   # CONFIG
    INFO: -> 800    # INFO
    WARN: -> 900    # WARNING
    ERROR: -> 1000  # SEVERE (highest value)

  debug: ->
    @log.apply @, [@levels.DEBUG].concat to_array arguments

  error: ->
    @log.apply @, [@levels.ERROR].concat to_array arguments

  info: ->
    @log.apply @, [@levels.INFO].concat to_array arguments

  warn: ->
    @log.apply @, [@levels.WARN].concat to_array arguments

  log: ->
    return -3 if @log_on is false
    return -2 if typeof console isnt 'object'
    return -1 if @level() is @levels.OFF()
    return @_print_log to_array arguments

  force_log: () ->
    return @_print_log to_array arguments

  set_domains: (domain_options) =>
    @domains = domain_options
    @log_on = @_check_log_permission()

  ###
  @param is_enabled [Boolean] True, if logging should be enabled
  @return [Integer] The new log level as number
  ###
  set_log_on: (is_enabled) =>
    @log_on = is_enabled

    if is_enabled and @level() is @levels.OFF()
      @level = @levels.LEVEL_1

    return @level()

  _parse_info: (arguments_array) ->
    for value in arguments_array
      if typeof value is 'string'
        @log_message = value
      else if typeof value is 'function'
        @log_level = value()
      else
        @log_objects.push value

  _print_log: (args) ->
    if args.length is 1
      if typeof args[0] is 'string'
        @log_message = args[0]
      else
        @log_objects.push args[0]
      @log_level = @levels.LEVEL_1()
    else
      @_parse_info args

    if @log_level is undefined
      @log_level = @levels.LEVEL_1()

    if @log_level < @level()
      @_reset()
      return 0

    if @log_message isnt undefined
      @log_layout = 1

      if @log_time
        time = moment().format 'HH:mm:ss.SSS'

        dashes = ''
        dashes = '-- ' if @log_level is @levels.LEVEL_2()
        dashes = '--- ' if @log_level is @levels.LEVEL_3()

        @log_message = "#{@logging_name} | #{time} | #{dashes}#{@log_message}"

      if @log_objects.length > 0
        @log_layout = 2

      if @color
        @log_layout = 3

    log = window.console.log

    log_method = if window.winston? then 'info' else 'log'

    switch @log_level
      when @levels.DEBUG() then log_method = 'debug'
      when @levels.INFO() then log_method = 'info'
      when @levels.WARN() then log_method = 'warn'
      when @levels.ERROR() then log_method = 'error'

    # Log message
    if @log_layout is 1
      window.console[log_method].call window.console, @log_message
      window.winston?[log_method].call window.winston, @log_message
    # Log message with objects
    else if @log_layout is 2
      window.console[log_method].call window.console, @log_message, @log_objects
      window.winston?[log_method].call window.winston, @log_message
    # Colored log message
    else if @log_layout is 3
      # Colored log message with objects
      if @log_objects.length > 0
        log.call window.console, "%c#{@log_message}", "color: #{@color}", @log_objects
     # Colored log message without objects
      else
        log.call window.console, "%c#{@log_message}", "color: #{@color}"

    @_reset()
    return 0

  _reset: ->
    @log_layout = -1
    @log_level = undefined
    @log_message = ''
    @log_objects = []
    @steps += 1
