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
  var browserStackTunnel  = null;

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

      browserStackTunnel = new BrowserStackTunnel(tunnelOptions);

      browserStackTunnel.start(function(error) {
        if (error) {
          return reject(error);
        }

        return resolve();
      });
    });
  }

  function closeTunnel() {
    return new Promise(function(resolve, reject) {
      browserStackTunnel.stop(function(error) {
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

  function saveScreenshot(driver, filepath) {
    return driver.takeScreenshot().then(function(data) {
      var pngBuf = new Buffer(data.replace(/^data:image\/png;base64,/,''), 'base64');
      grunt.file.write(filepath, pngBuf);
    });
  }

  function generateFilename(pattern, browser, url) {
    var filename = pattern;

    if(browser.browser) {
      filename = filename.replace(/\{browser\}/, slug(browser.browser));
    } else {
      filename = filename.replace(/\{browser\}-/, '');
    }
    if(browser.browserName) {
      filename = filename.replace(/\{browserName\}/, slug(browser.browserName));
    } else {
      filename = filename.replace(/\{browserName\}-/, '');
    }
    if(browser.browser_version) {
      filename = filename.replace(/\{browser_version\}/, slug(browser.browser_version));
    } else {
      filename = filename.replace(/\{browser_version\}-/, '');
    }
    if(browser.device) {
      filename = filename.replace(/\{device\}/, slug(browser.device));
    } else {
      filename = filename.replace(/\{device\}-/, '');
    }
    if(browser.platform) {
      filename = filename.replace(/\{platform\}/, slug(browser.platform));
    } else {
      filename = filename.replace(/\{platform\}-/, '');
    }
    if(browser.os) {
      filename = filename.replace(/\{os\}/, slug(browser.os));
    } else {
      filename = filename.replace(/\{os\}-/, '');
    }
    if(browser.os_version) {
      filename = filename.replace(/\{os_version\}/, slug(browser.os_version));
    } else {
      filename = filename.replace(/\{os_version\}-/, '');
    }
    if(url) {
      filename = filename.replace(/\{url\}/, slug(url));
    } else {
      filename = filename.replace(/\{url\}-/, '');
    }
    filename += '.png';
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
          async.eachSeries(options.pages, function(url, callback) {
            var logText = 'Creating screenshot for ' + url.url;
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
      pages: {},
      proxy: {},
      tunnelId: '',
      hosts: [{
        name: 'localhost',
        port: 80,
        sslFlag: 0
      }],
      filenamePattern: 'screenshots/{browser}-{browser_version}-{browserName}-{os}-{os_version}-{platform}-{device}-{url}'
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
