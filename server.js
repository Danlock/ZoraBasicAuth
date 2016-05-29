'use strict';

const Hapi = require('hapi');
const Basic = require('hapi-auth-basic');
const mongojs = require('mongojs');
const Routes = require('./routes.js');

const server = new Hapi.Server({ debug: { request: ['error'] } });
server.connection({ port: 3000 });
server.app.db = mongojs('hapi-rest-mongo'); 

server.register([
    Basic,
    Routes
    ], (err) => {

        server.start(() => {
        console.log('server running at: ' + server.info.uri);
    });
});