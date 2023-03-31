'use strict';

var sharedb = require('sharedb/lib/client');
var StringBinding = require('sharedb-string-binding');

// Open WebSocket connection to ShareDB server
var ReconnectingWebSocket = require('reconnecting-websocket');
var ctx = window.contextVars.wiki;
var wsPrefix = (window.location.protocol === 'https:') ? 'wss://' : 'ws://';
var wsUrl = wsPrefix + ctx.urls.sharejs;
var socket = new ReconnectingWebSocket(wsUrl);
var connection = new sharedb.Connection(socket);

var element = document.querySelector('textarea');


// Create local Doc instance mapped to 'examples' collection document with id 'textarea'
var doc = connection.get('examples', 'textarea');
doc.subscribe(function(err) {
if (err) throw err;

var binding = new StringBinding(element, doc, ['content']);
binding.setup();
});