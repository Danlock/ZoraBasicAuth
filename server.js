'use strict';

const Bcrypt = require('bcrypt');
const Joi = require('joi');
const Hapi = require('hapi');
const Basic = require('hapi-auth-basic');
const Boom = require('boom');

const server = new Hapi.Server();
server.connection({ port: 3000 });

const users = {
    john: {
        username: 'john',
        password: '12',   // 'secret'
        name: 'John Doe',
        fname: 'John',
        lname: 'Doe',
        email: 'john@doe.com',
        id: '2133d32a'
    }
};

const validate = function (request, username, password, callback) {
    const user = users[username];
    if (!user) {
        return callback(null, false);
    }
   // callback(null,password === user.password ,{ id: user.id, name: user.name });
    Bcrypt.compare(password, user.password, (err, isValid) => {
        callback(err, isValid, { id: user.id, name: user.name });
    });
};

const storeSignup = function (name, email, pw) {
    var index = name.indexOf(" ");
    var fname = name.substr(0, index);
    var lname = name.substr(index+1);

    //TODO: store in Postgres database

    return [fname,lname,pw];
}

//Authentication

server.register(Basic, (err) => {
    server.auth.strategy('simple', 'basic', { validateFunc: validate });

    // Accepts: name, email, password.
    //Stores: first_name, last_name, email, password
    //responds: first_name, last_name, password or error 
    server.route({
        method: 'POST',
        path: '/api/signup',
        config: {
            validate: {
                payload: {
                    name: Joi.string().min(2).max(60).required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().min(2).max(200).required()
                }
            },

            handler: function (request, reply) {
                var user = storeSignup(request.payload.name, request.payload.email,
                    request.payload.password);

                if (user) reply(user);
                else reply(Boom.unauthorized("Bad email or password!"));

                // reply('hullo, ' + request.auth.credentials.name);
            }
        }
    });

    //Accepts: email, password
    //Returns: first_name, last_name, email, basic auth header or error 
    server.route({
        method: 'POST',
        path: '/api/login',
        config: {
            auth: 'simple',
            handler: function (request, reply) {
                reply('hullo, ' + request.auth.credentials.name);
            }
        }
    });

    //Accepts: oldPass, newPass
    //responds: 200, or error 
    server.route({
        method: 'GET',
        path: '/api/reset/password',
       config: {
            auth: {strategy : 'simple'},
            handler: function (request, reply) {
                reply("Success, this should be a HTTP 200");
            }
        }
    });

        server.start(() => {
        console.log('server running at: ' + server.info.uri);
    });
});