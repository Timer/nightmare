/**
 * Module Dependencies
 */

var minstache = require('minstache');

/**
 * Run the `src` function on the client-side, capture
 * the response and logs, and send back via
 * ipc to electron's main process
 */

var execute = `
(function javascript () {
  var ipc = (window.__nightmare ? __nightmare.ipc : window[''].nightmare.ipc);
  try {
    var fn = ({{!src}}),
      response,
      args = [];

    {{#args}}args.push({{!argument}});{{/args}}

    if(fn.length - 1 == args.length) {
      args.push(((err, v) => {
          if(err) {
            ipc.send('error_{{!id}}', err.message || err.toString());
          }
          ipc.send('response_{{!id}}', v);
        }));
      fn.apply(null, args);
    }
    else {
      response = fn.apply(null, args);
      if(response && response.then) {
        response.then((v) => {
          ipc.send('response_{{!id}}', v);
        })
        .catch((err) => {
          ipc.send('error_{{!id}}', err)
        });
      } else {
        ipc.send('response_{{!id}}', response);
      }
    }
  } catch (err) {
    ipc.send('error_{{!id}}', err.message);
  }
})()
`;

/**
 * Inject the `src` on the client-side, capture
 * the response and logs, and send back via
 * ipc to electron's main process
 */

var inject = `
(function javascript () {
  var ipc = (window.__nightmare ? __nightmare.ipc : window[''].nightmare.ipc);
  try {
    var response = (function () { {{!src}} \n})()
    ipc.send('response_{{!id}}', response);
  } catch (e) {
    ipc.send('error_{{!id}}', e.message);
  }
})()
`;

/**
 * Export the templates
 */

exports.execute = minstache.compile(execute);
exports.inject = minstache.compile(inject);
