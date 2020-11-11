/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = function(controller) {

    controller.hears('宋江','message', async(bot, message) => {
      var key = "AIzaSyCXOj-eYdjWCYP4i1FBoEHZj3gNAJovCDY";                // API KEY
      var id = "7c84da9a39b231c0d"; // CSE ID
      var q = "cats";                          // QUERY


      function hndlr(response) {
        console.log(response);                 // a way to see your results
      }

      function triggersearch(){
        var query=document.getElementById("query").value;
        var JSElement = document.createElement('script');
        JSElement.src = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${id}&q=${q}`+query+'&callback=hndlr';
        document.getElementsByTagName('head')[0].appendChild(JSElement);
      }

      triggersearch();
    });

    controller.on('message', async(bot, message) => {
        //await bot.reply(message, `Echo: ${ message.text }`);
    });

}