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

window.Namespace 'zeta.webapp.module'


class zeta.webapp.module.Modal
  constructor: (@modal, @hide_callback, @before_hide_callback) ->
    @autoclose = true
    @init_exits()

  init_exits: ->
    keyboardJS.bind 'esc', @_hide
    $(@modal).click (e) => @_hide() if e.target == $(@modal)[0]

  _hide: =>
    @hide() if @autoclose

  show: ->
    $(@modal).addClass 'modal-show'
    setTimeout =>
      $(@modal).addClass 'modal-fadein'
    , 50

  hide: (callback) ->
    @before_hide_callback?()
    $(@modal)
      .removeClass 'modal-fadein'
      .one 'transitionend', =>
        $(@modal).removeClass 'modal-show'
        @hide_callback?()
        callback?()

  toggle: ->
    if @is_shown()
      @hide()
    else
      @show()

  is_shown: ->
    return $(@modal).hasClass 'modal-show'

  is_hidden: ->
    return not @is_shown()

  set_autoclose: (autoclose) ->
    @autoclose = autoclose

  destroy: ->
    $(@modal).off 'click'
    keyboardJS.unbind 'esc', @_hide
