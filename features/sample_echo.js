/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

function find_image(bot, message, options, result){
  if (result.length > 0){
    console.log(result);
    var start_value = Math.floor(Math.random() * 5);
    for (var j=0;j<result.length; j++ ) {
      var i = (j + start_value)%result.length;
      if (result[i].url.search('fbsbx') > 0)
        continue;
      if (result[i].url.search('.png') > 0 || result[i].url.search('.jpg') > 0 || result[i].url.search('.gif') > 0){
        console.log(message.text);
        console.log(result[i].url);
        /*await bot.reply(message,{
                blocks: [
                  {
                    "type": "image",                 
                    "image_url": result[i].url,
                    "alt_text": message.text
                  },
                ]
        });*/
        bot.reply(message, message.text + '\n' + result[i].url);
        break;
      }
    }
    // try second page
    options = {start:11};
    result = client.search(message.text.slice(1), options);

  }else{
    if (too_many_request == 1)
      bot.reply(message, `滿了, 明天請早`);
    else
      bot.reply(message, `找不到QQ`);
  }
}

module.exports = function(controller) {

    controller.hears(new RegExp(/抽/),'message', async(bot, message) => {
      if (message.text.search('抽') === 0){
        console.log('抽!');
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
        find_image(bot, result);
      }
    });

    controller.on('message', async(bot, message) => {
        //await bot.reply(message, `Echo: ${ message.text }`);
    });

}