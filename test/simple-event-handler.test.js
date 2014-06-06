'use strict';

var assert = require('power-assert');

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

        it('should be create new instance', function() {
            assert(!!this.simpleEventHandler);
        });

        it('should be fired the callback function', function(done) {
            var that = this;

            this.simpleEventHandler.on(this.eventName, function(ev) {
                assert(that.eventName === ev.type);
                done();
            });
            this.simpleEventHandler.trigger(this.eventName);
        });

        it('should be fired the handleEvent in object', function(done) {
            var that = this;

            this.simpleEventHandler.on(this.eventName, {
                handleEvent: function(ev) {
                    assert(that.eventName === ev.type);
                    done();
                }
            });
            this.simpleEventHandler.trigger(this.eventName);
        });

        it('should be not fired the callback function when called off method', function(done) {
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

        it('should be fired callback function by past triggered event', function(done) {
            var that = this;

            this.simpleEventHandler.trigger(this.eventName);
            this.simpleEventHandler.ready(this.eventName, function(ev) {
                assert(that.eventName === ev.type);
                done();
            });
        });

    });
});
