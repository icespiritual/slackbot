/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var last_query_time = 0;
var last_keyword = ' ';
var minutes = 1000 * 60;
var hours = minutes * 60;
var days = hours * 24;
var query_count = 0;
var fail_count = 0;
//var d = new Date();
//var t = d.getTime();
function find_image(bot, message, result){
  console.log(result);
  var start_value = Math.floor(Math.random() * 5);
  for (var j=0;j<result.length; j++ ) {
    var i = (j + start_value)%result.length;
    if (result[i].url.search('fbsbx') > 0 || result[i].url.search('kknews') > 0)
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
      return i;
    }
  }
  return -1;
}

module.exports = function(controller) {

    controller.hears(new RegExp(/抽/),'message', async(bot, message) => {
      if (message.text.search('抽') === 0){
        console.log('抽!');
        var key = "AIzaSyCXOj-eYdjWCYP4i1FBoEHZj3gNAJovCDY";                // API KEY
        var id = "7c84da9a39b231c0d"; // CSE ID
        const imageSearch = require('image-search-google');
        var d = new Date();
        var cur_time = d.getTime();
        var keyword = message.text.slice(1);
        if (cur_time - last_query_time < 10000 && last_keyword == keyword){
          console.log('too near same query!');
          return;
        }
        var last_hour = Math.floor(last_query_time / hours);
        last_hour = last_hour % 24;
        var last_day = Math.floor(last_query_time / days);
        var cur_hour = Math.floor(cur_time / hours);
        cur_hour = cur_hour % 24;
        var cur_day = Math.floor(cur_time / days);
        console.log("last day:" + last_day + " hour:" + last_hour);
        console.log("cur day:" + cur_day + " hour:" + cur_hour);
        // reset query count after 4:00PM
        
        if (((cur_day > last_day) && cur_hour >= 9) || (cur_day == last_day && cur_hour >= 9 && last_hour < 9) || (cur_day - last_day > 24))
          query_count = 0;
        last_keyword = keyword;
        last_query_time = cur_time;
        
        const client = new imageSearch(id, key);
        const options = {page:1};
        var result= [];
        var too_many_request = 0;
        try{
          result = await client.search(keyword, options);
        }
        catch(e){
          console.log('search image error' + e);
          too_many_request = 1;
        }
        var i = find_image(bot, message, result);
        if (i > 0){
          query_count++;
          await bot.reply(message, message.text + '(' + query_count + '/100)\n' + result[i].url);
          fail_count = 0;
        }
        else{
          if (too_many_request == 1){
            fail_count++;
            if (fail_count % 10 == 0)
              await bot.reply(message, `滿啦, 再玩要壞掉了');
            else
              await bot.reply(message, `滿了, 明天請早(` + query_count + '/100)');
          }
          else{
            // try second page
            console.log('second page');
            const options = {page:11};
            result = await client.search(message.text.slice(1), options);
            i = find_image(bot, message, result);
            if (i >= 0){
              query_count+= 2;
              await bot.reply(message, message.text + '(' + query_count + '/100)\n' + result[i].url);
              fail_count = 0;
            }
            else{
                await bot.reply(message, `找不到QQ`);
            }
          }
        }
      }
    });

    controller.on('message', async(bot, message) => {
        //await bot.reply(message, `Echo: ${ message.text }`);
    });

}