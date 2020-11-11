/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = function(controller) {

    controller.hears('宋江','message', async(bot, message) => {
      var key = "AIzaSyCXOj-eYdjWCYP4i1FBoEHZj3gNAJovCDY";                // API KEY
      var id = "7c84da9a39b231c0d"; // CSE ID
      const imageSearch = require('image-search-google');

      const client = new imageSearch(id, key);
      const options = {page:1};
      var result = await client.search('1234', options);
      console.log(result[0].url)
      await bot.reply(message,{
              blocks: [
                {
                  "type": "image",                 
                  "image_url": result[0].url,
                  "alt_text": "An incredibly cute kitten."
                },
              ]
        });
    });

    controller.on('message', async(bot, message) => {
        //await bot.reply(message, `Echo: ${ message.text }`);
    });

}