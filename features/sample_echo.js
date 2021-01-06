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
var working = 0; // to avoid multi-enrtry
var last_msg_id = '';

//var d = new Date();
//var t = d.getTime();
function find_image(bot, message, result){
  console.log(result);
  var start_value = Math.floor(Math.random() * 5);
  for (var j=0;j<result.length; j++ ) {
    var i = (j + start_value)%result.length;
    if (result[i].url.search('fbsbx') > 0 || result[i].url.search('kknews') > 0)
      continue;
    var str_idx = result[i].url.search('.png');
    if (str_idx <= 0)
      str_idx = result[i].url.search('.jpg');
    if (str_idx <= 0)
      str_idx = result[i].url.search('.gif');
    if (result[i].url.search('wikimedia') > 0)
      str_idx = result[i].url.slice(str_idx+4).search('.jpg');
    if (str_idx > 0){
      console.log(message.text);
      console.log(result[i].url);
      result[i].url = result[i].url.slice(0,str_idx+4);
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
      var keyword = message.text.slice(1);
      if (message.client_msg_id == last_msg_id)
      {
        console.log('same msg id!');
        return;
      }
      last_msg_id = message.client_msg_id;
      working = 1;
      if (message.text.search('抽') === 0){
        console.log('抽!');
        var key = "AIzaSyCXOj-eYdjWCYP4i1FBoEHZj3gNAJovCDY";                // API KEY
        var id = "7c84da9a39b231c0d"; // CSE ID
        const imageSearch = require('image-search-google');
        // load last query time and query count
        
        if (last_query_time == 0){
          var items = await controller.storage.read(['lastquerytime']);
          const lq_time = items['lastquerytime'] || {};
          if ('last_query_time' in lq_time){
            last_query_time = Number(lq_time.last_query_time);
            console.log("load last query time:" + last_query_time);
          }
          else{
            console.log("load last query time fail!");
          }
          items = await controller.storage.read(['querycount']);
          const q_count = items['querycount'] || {};
          if ('query_count' in q_count){
            query_count = Number(q_count.query_count);
            console.log("load query count:" + query_count);
          }
          else{console.log("load query count fail!");}
        }
        else{
          console.log('lqst_query_time have loaded');
        }
        if (keyword == 'momobot'){
          await bot.reply(message, `查我幹嘛`);
          working = 0;
          return;
        }
        var d = new Date();
        var cur_time = d.getTime();
        if (cur_time - last_query_time < 10000 && last_keyword == keyword){
          console.log('too near same query!');
          working = 0;
          return;
        }
        last_keyword = keyword;
        var last_hour = Math.floor(last_query_time / hours);
        last_hour = last_hour % 24;
        var last_day = Math.floor(last_query_time / days);
        var cur_hour = Math.floor(cur_time / hours);
        cur_hour = cur_hour % 24;
        var cur_day = Math.floor(cur_time / days);
        console.log("last day:" + last_day + " hour:" + last_hour);
        console.log("cur day:" + cur_day + " hour:" + cur_hour);
        // reset query count after 4:00PM
        
        if (((cur_day > last_day) && cur_hour >= 8) || (cur_day == last_day && cur_hour >= 8 && last_hour < 8) || (cur_day - last_day > 1))
          query_count = 0;
        // write to db
        last_query_time = cur_time;
        var __last_query_time = {last_query_time: '0'};
        __last_query_time.last_query_time = last_query_time.toString(10);
        await controller.storage.write({ 'lastquerytime': __last_query_time });
        
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
            if (fail_count % 3 == 0)
              await bot.reply(message, '阿就說滿了齁');
            else if (fail_count % 10 == 0)
              await bot.reply(message, '滿啦, 再玩要壞掉了');
            else
              await bot.reply(message, '滿了, 明天請早(' + query_count + '/100)');
          }
          else{
            // try second page
            console.log('second page');
            const options = {page:11};
            try{
              result = await client.search(keyword, options);
            }
            catch(e){
              console.log('search image error' + e);
              too_many_request = 1;
            }
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
        var __query_count = {query_count: '0'};
        __query_count.query_count = query_count.toString(10);
        await controller.storage.write({ 'querycount': __query_count });
        working = 0;
      }
      working = 0;
    });

    controller.on('message', async(bot, message) => {
        //await bot.reply(message, `Echo: ${ message.text }`);
    });

}