/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = function(controller) {

    controller.hears('宋江','message', async(bot, message) => {
      await bot.reply(message, '志杰.');
      var google = require('google')
 
      google.resultsPerPage = 25
      var nextCounter = 0

      google('node.js best practices', function (err, res){
        if (err) console.log("error!")//console.error(err)
        console.log(res.links.length)
        for (var i = 0; i < res.links.length; ++i) {
          var link = res.links[i];
          console.log(link.title + ' - ' + link.href)
          console.log(link.description + "\n")
        }

        if (nextCounter < 4) {
          nextCounter += 1
          if (res.next) res.next()
        }
      })
    });

    controller.on('message', async(bot, message) => {
        //await bot.reply(message, `Echo: ${ message.text }`);
    });

}