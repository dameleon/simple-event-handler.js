;(function(global) {
'use strict';

var _inNode = 'process' in global;
var _inWorker = 'WorlerLocation' in global;
var _inBrowser = 'document' in global;
var _useRequireJS = !_inNode && (typeof global.define === 'function' && global.define.amd);
var _document = null;
var _origin = '';
var _idCount = 0;

if (__inBrowser || __inWorker) {
    var location = global.location;

    _origin = location.origin || (location.protocol + '//' + location.hostname);
    _document = global.document;
}


////////////////////////////////////////
/////////// Constructor

/**
 * SimpleEventHandler class
 *
 * @class SimpleEventHandler
 */
function SimpleEventHandler() {
    // FIXME: nodejs でも一応動くようにしたいですね
    if (_inNode) {
        throw new Error("SimpleEventHandler cannot use in node.js");
    }
    var iframe = _document.createElement('iframe');

    this.id = iframe.id = 'simple-event-handler-iframe' + (_idCount++);
    iframe.width = 0;
    iframe.height = 0;
    iframe.style.margin = 0;
    iframe.style.padding = 0;
    iframe.style.display = 'none';
    _document.body.appendChild(iframe);

    this.iframeWindow = iframe.contentWindow;
    this.events = {};
    this.iframeWindow.addEventListener('message', this);
}


////////////////////////////////////////
/////////// class methods

SimpleEventHandler.prototype = {
    constructor       : SimpleEventHandler,
    on                : _on,
    off               : _off,
    ready             : _ready,
    once              : _once,
    one               : _once,
    trigger           : _trigger,
    triggerSync       : _triggerSync,
    callHandlers      : _callHandlers,
    getEvent          : _getEvent,
    handleEvent       : _handleEvent,
    createNewInstance : _createNewInstance
};


/**
 * bind handler to event by name
 *
 * @name on
 * @param {String} eventType                 event type name
 * @param {Function|Object|Promise} handler  event handling method or object
 */
function _on(eventType, handler) {
    var event = this.getEvent(eventType);
    var handlers = event.handlers;

    if (__getIndexByHandler(handlers, handler) > -1) {
        return false;
    }
    handlers[handlers.length] = __registerHandler(handler, false);
}

/**
 * unbind handler to event by name
 * if you do not pass handler parameter, it unbinds all handlers
 *
 * @name off
 * @param {String} eventType                   event type name
 * @param {Function|Object|Promise} [handler]  event handling method or object
 */
function _off(eventType, handler) {
    var event = this.getEvent(eventType);

    if (handler === undefined) {
        delete this.events[eventType];
    } else {
        var handlers = event.handlers;
        var index = __getIndexByHandler(handlers, handler);

        if (index > -1) {
            handlers.splice(index, 1);
        }
    }
}

/**
 * To immediately execute handler if the event was called at least once within the current instance.
 * in the case of events that have not been called yet, it waits until fired.
 *
 * @name ready
 * @param {String} eventType         event type name
 * @param {Function|Object|Promise}  handler  event handling method or object
 */
function _ready(eventType, handler) {
    var event = this.getEvent(eventType);
    var handlers = event.handlers;

    if (event.isCalled) {
        if (!event.data) {
            event.data = document.createEvent(eventType);
        }
        return __fire(handler, event);
    } else if (__getIndexByHandler(handlers, handler) > -1) {
        return false;
    }
    handlers[handlers.length] = __registerHandler(handler, true);
}

/**
 * bind handler to event by name and it is unbind by calling the handler when the event is fired
 *
 * @name once
 * @param {String} eventType         event type name
 * @param {Function|Object|Promise}  handler  event handling method or object
 */
function _once(eventType, handler) {
    var event = this.getEvent(eventType);
    var handlers = event.handlers;

    if (__getIndexByHandler(handlers, handler) > -1) {
        return false;
    }
    handlers[handlers.length] = __registerHandler(handler, true);
}

/**
 * firing event
 *
 * @name trigger
 * @param {String|Event} event  event type name or event object
 * @param {Any}          data   the data to attach to event
 */
function _trigger(event, data) {
    var eventType;

    if (typeof event === 'string') {
        eventType = event;
        event = __createEmptyEvent(eventType);
    } else {
        eventType = event.type;
    }
    var eventParam = this.getEvent(eventType);

    data && (event.data = data);
    eventParam.data = event;
    this.iframeWindow.postMessage(eventType, origin);
}

/**
 * trigger event with synchronize calling
 *
 * @name triggerSync
 * @param {String|Event} event  event type name or event object
 * @param {Any}          data   the data to attach to event
 *
 */
function _triggerSync(event, data) {
    var eventType;

    if (typeof event === 'string') {
        eventType = event;
        event = __createEmptyEvent(eventType);
    } else {
        eventType = event.type;
    }
    var eventParam = this.getEvent(eventType);

    data && (event.data = data);
    eventParam.data = event;
    this.callHandlers(eventType);
}

/**
 * call handlers with event name
 *
 * @name callHandlers
 * @param {String} eventType  event type name
 */
function _callHandlers(eventType) {
    var event = this.getEvent(eventType);
    var handlers = event.handlers;
    var data = event.data;
    var deletes = [];
    var i, val;

    event.isCalled = true;
    for (i = 0;
        (val = handlers[i]); i++) {
        __fire(val.handler, data);
        // Note. onceは一度呼んだら消すので一旦arrayに取っておく
        if (val.isOnce) {
            deletes[deletes.length] = val;
        }
    }
    event.data = null;
    for (i = 0;
        (val = deletes[i]); i++) {
        var index = handlers.indexOf(val);

        handlers.splice(index, 1);
    }
}

/**
 * get event config object
 *
 * @name callHandlers
 * @param {String} eventType  event type name
 * @return {Object}           event config object
 */
function _getEvent(eventType) {
    return this.events[eventType] || (this.events[eventType] = {
        isCalled: false,
        handlers: [],
        data: null
    });
}

/**
 * handling event called from iframe postmessage
 *
 * @name handleEvent
 * @param {Event} ev  event data instance
 */
function _handleEvent(ev) {
    // originがちがう子はそもそも受け付けない
    if (origin !== ev.origin) {
        return;
    }
    this.callHandlers(ev.data);
}

/**
 * create new SimpleEventHandler's instance
 *
 * @return {Object} SimpleEventHandler instance
 */
function _createNewInstance() {
    return new SimpleEventHandler();
}


////////////////////////////////////////
/////////// Private methods

function __createEmptyEvent(type) {
    var event = document.createEvent('Event');

    event.initEvent(type, true, true);
    return event;
}

function __getIndexByHandler(handlers, handler) {
    for (var i = 0, val;
        (val = handlers[i]); i++) {
        if (val.handler === handler) {
            return i;
        }
    }
    return -1;
}

function __fire(handler, ev) {
    // handleEventがある場合はhandleEventをもれなく呼ぶ
    return handler.handleEvent ? handler.handleEvent(ev) :
    // 普通の関数ならそのまま呼ぶ
    handler(ev);
}

function __registerHandler(handler, isOnce) {
    return {
        handler: handler,
        isOnce: !! isOnce
    };
}


////////////////////////////////////////
/////////// exports

// Note. SimpleEventHandler is always export to global by singleton instance.
// If you need another instance, to create new instance with createNewInstance() method.
var instance = new SimpleEventHandler();

if (_useRequireJS) {
    define([], function() {
        return instance;
    });
} else if (_inNode) {
    module.exports = instance;
} else {
    global.simpleEventHandler = instance();
}

})((this || 0).self || global);

