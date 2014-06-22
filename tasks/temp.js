var Promise = require("bluebird");
var BrowserStackTunnel = require('browserstacktunnel-wrapper');
var async = require('async');
var webdriver = require('browserstack-webdriver');
var fs = require('fs');


  var options = this.options({
    username: '',
    key: '',
    useTunnel: false,
    urls: [],
    proxy: {},
    tunnelId: '',
    hosts: [{
      name: 'localhost',
      port: 80,
      sslFlag: 0
    }],
  });

  function openTunnel(options) {
    return new Promise(function(resolve, reject) {
      var tunnelOptions = {};

      tunnelOptions.key = options.key;
      tunnelOptions.hosts = options.hosts;

      if(options.tunnelId) {
        tunnelOptions.tunnelIdentifier: options.tunnelId;
      }
      if(options.proxy) {
        if(options.proxy.username) {
          tunnelOptions.proxyUser: options.proxy.username;
        }
        if(options.proxy.password) {
          tunnelOptions.proxyPass: options.proxy.password;
        }
        if(options.proxy.port) {
          tunnelOptions.proxyPort: options.proxy.port;
        }
        if(options.proxy.host) {
          tunnelOptions.proxyHost: options.proxy.host;
        }
      }

      var BrowserStackTunnel = new BrowserStackTunnel(tunnelOptions);

      BrowserStackTunnel.start(function(error) {
        if (error) throw error;
        resolve();
      });
    });
  }

  function closeTunnel() {
    return new Promise(function(resolve, reject) {
      BrowserStackTunnel.stop(function(error) {
        if (error) throw error;
        resolve();
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
      fs.writeFile(filename, data.replace(/^data:image\/png;base64,/,''), 'base64', function(err) {
        if(err) throw err;
      });
    })
  }

  function takeScreenshots(options) {
    var maxConnections = 1;

    return new Promise(function(resolve, reject) {
      async.eachLimit(options.browsers, maxConnections, function(browser, callback) {
        connectBrowser(browser).then(function(driver) {
          async.eachSeries(options.urls, function(url, callback) {
            driver.get(url);
            saveScreenshot(driver, filename).then(function() {
              callback();
            });
          }, function() {
            driver.quit();
            callback();
          });
      }).finally(function() {
        resolve();
      });
    });
  }

  function screenshot(error, options, callback) {
    if(options.useTunnel) {
      return openTunnel(options).then(function() {
        return takeScreenshots(options);
      }).then(function() {
        return closeTunnel();
      });
    } else {
      return takeScreenshots(options);
    }
  }
