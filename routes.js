'use strict';

const Bcrypt = require('bcrypt');
const Joi = require('joi');
const Boom = require('boom');
const uuid = require('node-uuid');

// const users = {
//     "john@doe.com": {
//         password: '12',   // 'secret'
//         name: 'John Doe',
//         fname: 'John',
//         id: '2133d32a'
//     }
// };

const getUser = function (email,pw) {



    return [1,2,email,header];
}


exports.register = function (server, options, next) {
    const db = server.app.db;
    const users = db.collection('users');

    server.auth.strategy('simple', 'basic', { validateFunc: 
        function (request, username, password, callback) {

        const user = users.findOne({
            email: username,
            password: password
        }, (err,doc) => {
            if (err || !doc) {
                return callback(null, false);
            }

            callback(null,true,{fname: doc.fname,lname: doc.lname,email:username,password:doc.password});
            });
        }
    });

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
                    password: Joi.string().min(1).max(200).required()
                }
            },

            handler: function (request, reply) {
                var name = request.payload.name;
                var index = name.indexOf(" ");
                var fname = name.substr(0, index);
                var lname = name.substr(index+1);
                //Note, if this was production code here I would hash the plaintext password before putting it in the DB.
                var user = {_id: uuid.v1(),fname:fname,lname:lname,name:name,password:request.payload.password,email:request.payload.email};

                users.save(user, (err,result) => {
                    if (err) {
                        return reply(Boom.badData('Internal MongoDB error!', err));
                    } else {
                        reply(user);
                    }

                });
            }
        }
    });

    //Accepts: email, password
    //Returns: first_name, last_name, email, basic auth header or error 
    server.route({
        method: 'GET',
        path: '/api/login',
        config: {
            auth: 'simple',
            handler: function (request, reply) {
                var header = 'Basic ' 
                    + (new Buffer(request.auth.credentials.email + ':' 
                    + request.auth.credentials.password, 'utf8'))
                    .toString('base64');

                var user = [request.auth.credentials.fname,
                    request.auth.credentials.lname,
                    request.auth.credentials.email,header]

                reply(user);
                
            }
        }
    });

    //Accepts: oldPass, newPass
    //responds: 200, or error 
    server.route({
        method: 'POST',
        path: '/api/reset/password',
       config: {
            validate: {
                payload: {
                    oldPass: Joi.string().min(1).max(200).required(),
                    newPass: Joi.string().min(1).max(200).required()
                }
            },
            auth: {
                strategy : 'simple'
            },
            handler: function (request, reply) {
                users.update({
                    email:request.auth.credentials.email,
                    password:request.payload.oldPass
                }, {
                password: request.payload.newPass
                }, (err, result) => {
                    if (err || result.n === 0) {
                        return reply(Boom.badData('Not found or Internal MongoDB error!', err));
                    }
                    reply().code(200);
                });
            }
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes'
}