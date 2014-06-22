/*
 * grunt-browserstack-screenshot
 * https://github.com/vrykolas/grunt-browserstack-screenshot
 *
 * Copyright (c) 2014 Vrykolas
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('browserstack_screenshot', 'Take cross-browser screenshots with Browserstack', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      username: '',
      password: '',
      useTunnel: false,
      urls: [],
      key: '',
      proxy: {},
      tunnelId: '',
      hosts: [{
        name: 'localhost',
        port: 80,
        sslFlag: 0
      }],
    });



//node-browserstack
var BrowserStack = require( 'browserstack' );
var client = BrowserStack.createClient({
    username: 'foo',
    password: 'p455w0rd!!1'
});

client.getBrowsers(function( error, browsers ) {
    console.log( 'The following browsers are available for testing' );
    console.log( browsers );
});

client.createWorker( settings, function( error, worker ) {
});

client.takeScreenshot( id, function( error, data ) {
});

client.terminateWorker( id, function( error, data ) {
});




BrowserStack.createClient( settings )

Creates a new client instance.

    settings: A hash of settings that apply to all requests for the new client.
        username: The username for the BrowserStack account.
        password: The password for the BrowserStack account.
        version (optional; default: 3): Which version of the BrowserStack API to use.
        server (optional; default: { host: 'api.browserstack.com', port: 80 }): An object containing host and port to connect to a different BrowserStack API compatible service.


client.getBrowsers( callback )

Gets the list of available browsers.

    callback (function( error, browsers )): A callback to invoke when the API call is complete.
        browsers: An array of browser objects.


client.createWorker( settings, callback )

Creates a worker.

    settings: A hash of settings for the worker (an extended browser object).
        os: See browser object for details.
        os_version: See browser object for details.
        browser: See browser object for details.
        browser_version: See browser object for details.
        device: See browser object for details.
        url (optional): Which URL to navigate to upon creation.
        timeout (optional): Maximum life of the worker (in seconds). Use 0 for 'forever' (BrowserStack will kill the worker after 1,800 seconds).
    callback (function( error, worker )): A callback to invoke when the API call is complete.
        worker A worker object.

worker objects

Worker objects are extended browser objects which contain the following additional properties:

    id: The worker id.
    status: A string representing the current status of the worker.
        Possible statuses: 'running', 'queue'.


client.takeScreenshot( id, callback )

Take a screenshot at current state of worker.

    callback (function( error, data )): A callback to invoke when the API call is complete.
        data: An object with a url property having the public url for the screenshot.


client.terminateWorker( id, callback )

Terminates an active worker.

    id: The id of the worker to terminate.
    callback (function( error, data )): A callback to invoke when the API call is complete.
        data: An object with a time property indicating how long the worker was alive.



//browserstacktunnel-wrapper
var BrowserStackTunnel = require('browserstacktunnel-wrapper');

var browserStackTunnel = new BrowserStackTunnel({
  key: YOUR_KEY,
  hosts: [{
    name: 'localhost',
    port: 8080,
    sslFlag: 0
  }],
  tunnelIdentifier: 'my_tunnel', // optionally set the -tunnelIdentifier option
  skipCheck: true, // optionally set the -skipCheck option
  v: true, // optionally set the -v (verbose) option
  proxyUser: PROXY_USER, // optionally set the -proxyUser option
  proxyPass: PROXY_PASS, // optionally set the -proxyPass option
  proxyPort: PROXY_PORT, // optionally set the -proxyPort option
  proxyHost: PROXY_HOST // optionally set the -proxyHost option
});

browserStackTunnel.start(function(error) {
  if (error) {
    console.log(error);
  } else {
    // tunnel has started

    browserStackTunnel.stop(function(error) {
      if (error) {
        console.log(error);
      } else {
        // tunnel has stopped
      }
    });
  }
});






    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file '' + filepath + '' not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join(grunt.util.normalizelf(options.separator));

      // Handle options.
      src += options.punctuation;

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File '' + f.dest + '' created.');
    });
  });

};
