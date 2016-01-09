'use strict';


/**
 * @param {object} config
 * @param {boolean} [config.redirect=true] - Redirect or block
 * @param {number|string} [config.status]   - Redirect Status Code, default:
 *                                            301 for redirect:true and 403 for redirect:false
 * @param {number|string} [config.httpsPort]      - HTTPS Port
 * @param {string} [config.body]      - HTML Response body if redirect:false
 * @param {boolean} [config.trustHeaders=false] - Trust Proxy Headers 'x-forwarded-proto' and 'x-arr-ssl
 */
module.exports = function redirectMw(config) {

  console.log('* Enabling redirect HTTP to HTTPS...');
  config = config || {};
  if (typeof config.redirect     === 'undefined') { config.redirect     = true; }
  if (typeof config.trustHeaders === 'undefined') { config.trustHeaders = false; }
  config.status = config.status || (config.redirect ? 301 : 403);
  if (config.httpsPort && typeof config.httpsPort !== 'string') {
    config.httpsPort = config.httpsPort.toString();
  }
  config.body = config.body || '<>Forbidden. Please use HTTPS protocol.';

  function extractUrl(req) {
    // localhost:8080
    //var regexp = /(.+):(\d{1,5})/g; // does not match '10.10.10.10'
    var regexp = /([a-z0-9\-._~%]+):?(\d+)?/gi;
    var match  = regexp.exec(req.headers.host);
    var res = {
      protocol: req.protocol,
      host: match[ 1 ],
      port: match[ 2 ] || ( req.secure ? '443' : '80' ),
      path: req.url
    };
    //console.log('extractUrl():', res);
    return res;
  }

  function redirectNeeded(req, origUrlObj, httpsPort) {
    return ! ( (req.secure && origUrlObj.port === httpsPort) ||
      ( config.trustHeaders &&

          // IBM Bluemix: https://developer.ibm.com/answers/questions/16016/how-do-i-enforce-ssl-for-my-bluemix-application.html
          // X-Forwarded-Proto: supported , X-Forwarded-Port: not supported
          //
          // Heroku: https://devcenter.heroku.com/articles/http-routing#heroku-headers
          // X-Forwarded-Proto: supported , X-Forwarded-Port: supported
          //
          // AWS ELB: http://docs.aws.amazon.com/ElasticLoadBalancing/latest/DeveloperGuide/x-forwarded-headers.html
          // X-Forwarded-Proto: supported , X-Forwarded-Port: supported
          //
        (req.headers['x-forwarded-proto'] === 'https' ||

          // Azure headers
          //
        !! req.headers['x-arr-ssl'])
      )
    );
  }

  function urlToHttps(origUrlObj, httpsPort) {
    var protocol = 'https';
    return protocol + '://' + origUrlObj.host + ':' + httpsPort + origUrlObj.path; // HTTPS url
  }

  return function(req, res, next) {
    //console.log('mini-https-redirect');
    var origUrlObj = extractUrl(req);
    var finalUrl = urlToHttps(origUrlObj, config.httpsPort);
    return redirectNeeded(req, origUrlObj, config.httpsPort) ? (
      config.redirect ? res.status(config.status).redirect(finalUrl) : res.status(config.status).send(config.body)
    ) : next();
  };

};


