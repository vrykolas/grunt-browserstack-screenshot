/*
 * grunt-browserstack-screenshot
 * https://github.com/vrykolas/grunt-browserstack-screenshot
 *
 * Copyright (c) 2014 Vrykolas
 * Licensed under the MIT license.
 */

'use strict';

var Promise = require('bluebird');
var BrowserStackTunnel = require('browserstacktunnel-wrapper');
var async = require('async');
var webdriver = require('browserstack-webdriver');
var fs = require('fs');
var slug = require('slug');


module.exports = function(grunt) {

  function openTunnel(options) {
    return new Promise(function(resolve, reject) {
      var tunnelOptions = {};

      tunnelOptions.key = options.key;
      tunnelOptions.hosts = options.hosts;

      if(options.tunnelId) {
        tunnelOptions.tunnelIdentifier =  options.tunnelId;
      }
      if(options.proxy) {
        if(options.proxy.username) {
          tunnelOptions.proxyUser = options.proxy.username;
        }
        if(options.proxy.password) {
          tunnelOptions.proxyPass = options.proxy.password;
        }
        if(options.proxy.port) {
          tunnelOptions.proxyPort = options.proxy.port;
        }
        if(options.proxy.host) {
          tunnelOptions.proxyHost = options.proxy.host;
        }
      }

      var BrowserStackTunnel = new BrowserStackTunnel(tunnelOptions);

      BrowserStackTunnel.start(function(error) {
        if (error) {
          return reject(error);
        }

        return resolve();
      });
    });
  }

  function closeTunnel() {
    return new Promise(function(resolve, reject) {
      BrowserStackTunnel.stop(function(error) {
        if (error) {
          return reject(error);
        }

        return resolve();
      });
    });
  }

  function connectBrowser(browser) {
    return new Promise(function(resolve, reject) {
      // Input capabilities
      var driver = new webdriver.Builder().
        usingServer('http://hub.browserstack.com/wd/hub').
        withCapabilities(browser).
        build();

      resolve(driver);
    });
  }

  function saveScreenshot(driver, filename) {
    return driver.takeScreenshot().then(function(data) {
      fs.writeFile(filename, data.replace(/^data:image\/png;base64,/,''), 'base64', function(error) {
        if(error) {
          throw error;
        }
      });
    });
  }

  function generateFilename(pattern, browser, url) {
    var filename = pattern;

    if(!browser.os) {
      browser.os = '';
    }
    if(!browser.os_version) {
      browser.os_version = '';
    }
    if(!browser.browser) {
      browser.browser = '';
    }
    if(!browser.browser_version) {
      browser.browser_version = '';
    }
    if(!browser.device) {
      browser.device = '';
    }
    if(!url) {
      url = '';
    }

    filename = filename.replace(/\{os\}/, slug(browser.os));
    filename = filename.replace(/\{os_version\}/, slug(browser.os_version));
    filename = filename.replace(/\{browser\}/, slug(browser.browser));
    filename = filename.replace(/\{browser_version\}/, slug(browser.browser_version));
    filename = filename.replace(/\{device\}/, slug(browser.device));
    filename = filename.replace(/\{url\}/, slug(url));
    filename = filename.replace(/\{ext\}/, '.png');
    filename = filename.replace(/--/, '-');

    return filename;
  }

  function takeScreenshots(options) {
    return new Promise(function(resolve, reject) {
      async.eachSeries(options.browsers, function(browser, callback) {
        browser['browserstack.user'] = options.username;
        browser['browserstack.key'] = options.key;
        if(options.useTunnel) {
          browser['browserstack.local'] = true;
        }

        connectBrowser(browser).then(function(driver) {
          async.eachSeries(options.urls, function(url, callback) {
            var logText = 'Creating screenshot for ' + url;
            logText += ' with ' + browser.browser + ' ' + browser.browser_version;
            logText += ' on ' + browser.os + ' ' + browser.os_version;
            if(browser.device) {
              logText += ' using a ' + browser.device;
            }
            grunt.log.writeln(logText);

            if(url.dirname.substr(-1) !== '/' ) {
              url.dirname += '/';
            }

            var filename = url.dirname + generateFilename(options.filenamePattern, browser, url);

            driver.get(url.url);
            saveScreenshot(driver, filename).then(function() {
              callback();
            }, function(error) {
              callback(error);
            });
          }, function(error) {
            driver.quit();
            callback(error);
          });
        });
      }, function(error) {
        if (error) {
          return reject(error);
        }

        return resolve();
      });
    });
  }

  grunt.registerMultiTask('browserstack_screenshot', 'Take cross-browser screenshots with Browserstack', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var screenshots;
    var options = this.options({
      username: '',
      key: '',
      useTunnel: false,
      browsers: [],
      urls: {},
      proxy: {},
      tunnelId: '',
      hosts: [{
        name: 'localhost',
        port: 80,
        sslFlag: 0
      }]
    });

    var done = this.async();

    if(options.useTunnel) {
      screenshots = openTunnel(options).then(function() {
        return takeScreenshots(options);
      }).finally(function() {
        return closeTunnel();
      });
    } else {
      screenshots = takeScreenshots(options);
    }
    screenshots.finally(function() {
      done();
    });
  });

};
