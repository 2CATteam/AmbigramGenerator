// create the webworker
var worker = new Worker('./worker.js');

// add event listener to handle webworker response
worker.addEventListener('message', function(e) {
    console.log('Worker said: ', e.data);
  }, false);

// send message to the webworker
worker.postMessage('<xml xmlns="a" xmlns:c="./lite">\n'+
'\t<child>test</child>\n'+
'\t<child></child>\n'+
'\t<child/>\n'+
'</xml>');
