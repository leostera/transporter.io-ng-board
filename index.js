var io = require('engine.io')
  , async = require('async');

module.exports = {
  server: null,
  clients: [],

  serveFiles: function ( opts ) {
    if(this.server) {
      console.error('transporter.io-ng-board: Oops! Already serving...');
      return;
    }

    opts = opts || {};
    opts.port = opts.port || 3000;
    opts.dir  = opts.dir || __dirname;
    opts.route = opts.route || '/';

    var express = require('express')
      , app = express(app);
    
    this.server = require('http').createServer(app);

    app.use(express.static(opts.dir));
    app.get(opts.route, function(req, res, next){
      res.sendfile(opts.dir+'/index.html');
    });

    this.server.listen(opts.port, function(){
      console.log('\033[96mserving on localhost:'+opts.port+' \033[39m');
    });
    
    io = io.attach(this.server);
    io.on('connection', function ( socket ) {
      this.clients.push(socket);

      this.clients.forEach(function (c) {
        c.on('close', function ( ) {
          this.clients.splice(this.clients.indexOf(c));
        }.bind(this));
      }.bind(this));
      
    }.bind(this));
  },

  listen: function ( port ) {
    if(this.server) {
      console.error('transporter.io-ng-board: Oops! Already listening...');
      return;
    }
    this.server = io.listen(port);
    console.log('\033[96mlistening on localhost:'+port+' \033[39m');
    this.server.on('connection', function ( socket ) {
      this.clients.push(socket);

      this.clients.forEach(function (c) {
        c.on('close', function ( ) {
          this.clients.splice(this.clients.indexOf(c));
        }.bind(this));
      }.bind(this));
      
    }.bind(this));
  },

  publish: function ( data ) {
    if(this.clients.length<1) {
      // console.warn('Can\'t send message to nobody');
      return;
    }

    if(this.arguments < 3) {
      var useBSON = false;
    }

    console.log(data);

    async.forEach(this.clients, function (c, cb) {
      var obj; 

      if(this.useBSON || useBSON) {
        obj = bson.serialize(data, false, true, false);
      } else {
        obj = JSON.stringify(data);
      }
      
      c.send(obj);
      cb(null);
    }, function (errors) {
      if(errors) {
        console.error(errors);
      }
    });
  }
};