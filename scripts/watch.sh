#!/bin/sh
grunt --gdsrc=/usr/local/lib/node_modules/sails/node_modules

mongod --auth


db.addUser( { user: "yun77op",
              pwd: "orchild",
              roles: [ "userAdminAnyDatabase" ] } );


              use cfail
db.addUser( { user: "cfail",
              pwd: "cfail",
              roles: [ "readWrite", "dbAdmin" ]
            } );

db.auth('cfail', 'cfail');