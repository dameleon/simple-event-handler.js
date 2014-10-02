'use strict';

var assert = require('power-assert');
var _ = require('lodash');

describe('SimpleEventHandler', function() {
    before(function() {
        this.simpleEventHandler = global.simpleEventHandler;
    });

    it('should exist in global', function() {
        assert(this.simpleEventHandler !== undefined);
    })

    it('should create iframe to document.body', function() {
        var id = this.simpleEventHandler.id;
        var iframe = document.getElementById(id);

        assert(iframe !== null);
        assert(iframe.tagName.toLowerCase() === 'iframe');
    });

    describe('class methods', function() {
        before(function() {
            this.eventName = 'test_event';
        });

        beforeEach(function() {
            this.simpleEventHandler = global.simpleEventHandler.createNewInstance();
        });

        afterEach(function() {
            this.simpleEventHandler.off(this.eventName);
        });

        it('should create new instance', function() {
            assert(!!this.simpleEventHandler);
        });

        it('should fired the callback function', function(done) {
            var that = this;

            this.simpleEventHandler.on(this.eventName, function(ev) {
                assert(that.eventName === ev.type);
                done();
            });
            this.simpleEventHandler.trigger(this.eventName);
        });

        it('should fired the handleEvent in object', function(done) {
            var that = this;

            this.simpleEventHandler.on(this.eventName, {
                handleEvent: function(ev) {
                    assert(that.eventName === ev.type);
                    done();
                }
            });
            this.simpleEventHandler.trigger(this.eventName);
        });

        it('should fired different events when multiple triggered', function(done) {
            var that = this;
            var eventObjects = [];
            var q = function(ev) {
                eventObjects.push(ev);
                q.count++
                if (q.count === q.limit) {
                    assert(_.unique(eventObjects).length === q.limit);
                    done();
                }
            };

            q.count = 0;
            q.limit = 2;
            this.simpleEventHandler.on(this.eventName, q);
            this.simpleEventHandler.trigger(this.eventName);
            this.simpleEventHandler.trigger(this.eventName);
        });

        it('should not fired the callback function when called off method', function(done) {
            var cb = function(reason) {
                assert(reason === 'timeout');
                done();
            };
            var handler = function() {
                cb('event');
            };

            this.simpleEventHandler.on(this.eventName, handler);
            this.simpleEventHandler.off(this.eventName, handler);
            this.simpleEventHandler.trigger(this.eventName);
            setTimeout(function() {
                cb('timeout');
            }, 150);
        });

        it('should fired the callback function by past triggered event', function(done) {
            var that = this;

            this.simpleEventHandler.trigger(this.eventName);
            this.simpleEventHandler.ready(this.eventName, function(ev) {
                assert(that.eventName === ev.type);
                done();
            });
        });

        it('should fired the callback function with triggerSync method', function() {
            var that = this;

            this.simpleEventHandler.on(this.eventName, function(ev) {
                assert(that.eventName === ev.type);
            });
            this.simpleEventHandler.triggerSync(this.eventName);
        });
    });
});
