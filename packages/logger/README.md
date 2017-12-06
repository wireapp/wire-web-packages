# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp/wire](https://github.com/wireapp/wire).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## Description

A powerful logger for Texts and objects (not for functions!).

## Instructions

```bash
npm install
grunt

# Create release version
grunt dist
```

## Log level order

```coffeescript
OFF: -> 0
LEVEL_1: -> 300 # FINEST (lowest value)
LEVEL_2: -> 400 # FINER
LEVEL_3: -> 500 # FINE
DEBUG: -> 700   # CONFIG
INFO: -> 800    # INFO
WARN: -> 900    # WARNING
ERROR: -> 1000  # SEVERE
```

## Recommended usage of log levels

* **OFF** — If you don't want to receive any log messages
* **LEVEL_1** — For function calls (right at the beginning of a function)
* **LEVEL_2** — For callbacks of a function call (success or error)
* **LEVEL_3** — For conclusions from values and states (sentences like "Because the number is 5 we have...")
* **INFO** — Info that could be relevant to end users (like IDs which they need to tell to customer support)
* **WARN** — Errors in an application which **reduce** the user experience
* **ERROR** — Error in an application which **destroy** the user experience

## Usage

```coffeescript
class Demo.DemoClass
  constructor: () ->
    @logger = new z.util.Logger 'Test', options
    @logger.level = @logger.levels.LEVEL_1

    object =
      first_line: "Hello"
      second_line: "World"

  @logger.log 'Log text.'
  @logger.log 'Log text with object.', object
  @logger.log 'Log text with priority.', @logger.levels.WARN
	@logger.log 'Log text with priority and objects.', @logger.levels.WARN, object, object
	@logger.log 'Log in whatever order you want.', object, @logger.levels.INFO, object, object

  # Use aliases for different log levels
  @logger.info 'Log text as info.'
  @logger.debug 'Log text as debug.'
  @logger.error 'Log text as error.'
  @logger.warn 'Log text as warning.'

  # Only log steps which have a minimum log level of info
  @logger.level = @logger.levels.INFO
  @logger.log 'This will not be shown.'
  @logger.log 'This will...!', @logger.levels.INFO
  @logger.log 'And this too!', @logger.levels.WARN
  @logger.log @logger.levels.WARN', Even this!'

  # Don't show any log messages
  @logger.level = @logger.levels.OFF
```

##### Another example

```coffeescript
@logger = new z.util.Logger 'z.auth.AuthRepository', name_length: 54
@logger.set_domains
  'localhost': @logger.levels.LEVEL_1
  'appspot.com': @logger.levels.LEVEL_1
  'wire.com': @logger.levels.INFO
```
