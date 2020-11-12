/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = function(controller) {

    controller.hears(new RegExp(/抽/),'message', async(bot, message) => {
      if (message.text.search('抽') === 0){
        var key = "AIzaSyCXOj-eYdjWCYP4i1FBoEHZj3gNAJovCDY";                // API KEY
        var id = "7c84da9a39b231c0d"; // CSE ID
        const imageSearch = require('image-search-google');

        const client = new imageSearch(id, key);
        const options = {page:1};
        var result= [];
        var too_many_request = 0;
        try{
          result = await client.search(message.text.slice(1), options);
        }
        catch(e){
          console.log('search image error' + e);
          too_many_request = 1;
        }
        if (result.length > 0){
          var start_value = Math.floor(Math.random() * 5);
          for (var i=start_value; i<result.length; ++i) {
            if (result[i].url.search('.png') > 0 || result[i].url.search('.jpg') > 0 || result[i].url.search('.gif') > 0){
              console.log(result[i].url)
              /*await bot.reply(message,{
                      blocks: [
                        {
                          "type": "image",                 
                          "image_url": result[i].url,
                          "alt_text": message.text
                        },
                      ]
              });*/
              await bot.reply(message.text, +'\n' + result[i].url);
              break;
            }
          }
        }else{
          if (too_many_request == 1)
            await bot.reply(message, `滿了, 明天請早`);
          else
            await bot.reply(message, `找不到QQ`);
        }
      }
    });

    controller.on('message', async(bot, message) => {
        //await bot.reply(message, `Echo: ${ message.text }`);
    });

}