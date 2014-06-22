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

  function takeScreenshots(options) {
    return new Promise(function(resolve, reject) {
      async.eachLimit(options.urls, maxConnections, function(item, callback) {

      }, function(error) {
        if error throw error;
        resolve();
      })
    });
  }


// Input capabilities
var capabilities = {
  'browserName' : 'firefox',
  'browserstack.user' : 'USERNAME',
  'browserstack.key' : 'ACCESS_KEY'
}

var driver = new webdriver.Builder().
  usingServer('http://hub.browserstack.com/wd/hub').
  withCapabilities(capabilities).
  build();

driver.get('http://www.google.com/ncr');
webdriver.WebDriver.prototype.saveScreenshot = function(filename) {
  return driver.takeScreenshot().then(function(data) {
    fs.writeFile(filename, data.replace(/^data:image\/png;base64,/,''), 'base64', function(err) {
      if(err) throw err;
    });
  })
};

driver.quit();














    });
  }

  function saveScreenshot(driver, filename) {
    return driver.takeScreenshot().then(function(data) {
      fs.writeFile(filename, data.replace(/^data:image\/png;base64,/,''), 'base64', function(err) {
        if(err) throw err;
      });
    })
  }

  function takeScreenshot(browser, url, filename) {
    return new Promise(function(resolve, reject) {
      // Input capabilities
      var driver = new webdriver.Builder().
        usingServer('http://hub.browserstack.com/wd/hub').
        withCapabilities(browser).
        build();

      driver.get(url);
      saveScreenshot(driver, filename).then(resolve, reject).finally(function() {
        driver.quit();
      });
    });
  }

  function (error, options, callback) {
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




//BrowserStackTunnel-wrapper

});








client.getBrowsers(function( error, browsers ) {
    console.log( 'The following browsers are available for testing' );
    console.log( browsers );
});

