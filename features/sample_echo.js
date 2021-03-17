/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var request = require("request");
var cheerio = require("cheerio");
const got = require("got");
var last_query_time = 0;
var last_keyword = ' ';
var minutes = 1000 * 60;
var hours = minutes * 60;
var days = hours * 24;
var query_count = 0;
var fail_count = 0;
var working = 0; // to avoid multi-enrtry
var last_msg_id = [];
var last_source = [];

//var d = new Date();
//var t = d.getTime();
function find_image(bot, message, result, draw_mode){
  console.log(result);
  var start_value = Math.floor(Math.random() * 5);
  var draw_count = (draw_mode == 2) ? 3 : 1;
  var drawn_count = 0;
  var found_images = [];
  if (draw_count > 1)
    start_value = 0;
  for (var j=0;j<result.length; j++ ) {
    var i = (j + start_value)%result.length;
    if (result[i].url.search('fbsbx') > 0 || result[i].url.search('kknews') > 0 || result[i].url.search('hk01.com') > 0)
      continue;
    /*var str_idx = result[i].url.lastIndexOf('.png');
    if (result[i].url.search('wikia.nocookie.net') > 0)
      str_idx = result[i].url.length - 4;
    if (str_idx <= 0)
      str_idx = result[i].url.lastIndexOf('.jpg');
    if (result[i].url.search('ws.126.net') > 0)
      str_idx = result[i].url.length - 4;
    if (str_idx <= 0)
      str_idx = result[i].url.lastIndexOf('.gif');*/
    if (true)/*(str_idx > 0)*/{
      console.log(message.text);
      console.log(result[i].url);
      //result[i].url = result[i].url.slice(0,str_idx+4);
      /*await bot.reply(message,{
              blocks: [
                {
                  "type": "image",                 
                  "image_url": result[i].url,
                  "alt_text": message.text
                },
              ]
      });*/
      found_images.push(i);
      last_source.push(result[i].context);
      drawn_count++;
      if (drawn_count >= draw_count)
        return found_images;
    }
  }
  return found_images;
}

function get_key_list(table){
	var key_list = '';
	for (var prop in table){
        key_list = key_list + prop.slice(1) + ' ';
    }
	return key_list;
}

function get_random_item(table){
	var keys = Object.keys(table);
     return table[keys[ keys.length * Math.random() << 0]];
}

module.exports = function(controller) {

    controller.hears(new RegExp(/抽/),'message', async(bot, message) => {
      if (last_msg_id.length > 0 && last_msg_id.indexOf(message.client_msg_id) >= 0)
      {
        console.log('same msg id!');
        return;
      }
      last_msg_id.push(message.client_msg_id);
      working = 1;
      var draw_mode = 0; // 0: wrong, 1:draw once 2: draw three times
      if (message.text.search('抽') === 0)
        draw_mode = 1;
      else if (message.text.search('爆抽') === 0)
        draw_mode = 2;
      if (draw_mode > 0){
        console.log('抽!');
        var keyword = message.text.slice(draw_mode);
        if (keyword.length == 0)
        {
          await bot.reply(message, "請別抽空字串");
          return;
        }
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
        // sepecific behavior about keyword
        if (keyword == 'momobot'){
          await bot.reply(message, `查我幹嘛`);
          working = 0;
          return;
        }
        else if (keyword == 'momo'){
          keyword = 'Sakura Momo';
        }
        else if (message.text.search('ㄇㄇ') >= 0){
          var tablekeith = new Object();
          tablekeith.pㄇㄇ貓 = `https://i.imgur.com/Adp22A2.jpg`;
          tablekeith.pㄇㄇ北斗 = `https://i.imgur.com/C5gFcE5.png`;
          tablekeith.pㄇㄇ獵人 = `https://i.imgur.com/iPftKTt.png`;
          tablekeith.pㄇㄇ枝枝 = `https://i.imgur.com/X7j7uiV.jpg`;
          
          var key_name = 'p' + keyword;
          if (keyword == 'ㄇㄇ'){
            var random_item = get_random_item(tablekeith);
            await bot.reply(message, random_item);
            working = 0;
            return;  
          }
          else if (tablekeith.hasOwnProperty(key_name)){
            await bot.reply(message, tablekeith[key_name]);
            working = 0;
            return;
          }
          else if (keyword == 'ㄇㄇ列表'){
            var all_key_name = get_key_list(tablekeith);
            console.log(all_key_name);
            await bot.reply(message, all_key_name);
            working = 0;
            return;
          }
        }
        else if (keyword == 'ㄇㄎ'){
          var rng_value = Math.floor(Math.random() * 3);
          if (rng_value < 1)
            await bot.reply(message, `https://i.imgur.com/vfVs7xB.jpeg`);
          if (rng_value < 2)
            await bot.reply(message, `https://i.imgur.com/VVQiBX3.jpg`);
          else
            await bot.reply(message, `https://upload.cc/i1/2021/01/28/pv1oqH.gif`);
          
          working = 0;
          return;
        }
        else if (message.text.search('52') >= 0){
          var table52 = new Object();
          table52.p52躺 = `https://i.imgur.com/h9T5m0e.jpg`;
          table52.p52婷宣 = `https://i.imgur.com/PXRbkFd.jpg`;
          table52.p52枝枝 = `https://i.imgur.com/MrLkboU.jpg`;
          table52.p52枝枝神秘 = `https://i.imgur.com/Zke2Cyl.jpg`;
          table52.p52謎之女 = `https://i.imgur.com/B8niuA4.jpg`;
          table52.p52坐 = `https://i.imgur.com/eyF1PW9.jpg`;
          var key_name = 'p' + keyword;
          if (keyword == '52'){
            var random_item = get_random_item(table52);
            await bot.reply(message, random_item);
            working = 0;
            return;  
          }
          else if (table52.hasOwnProperty(key_name)){
            await bot.reply(message, table52[key_name]);
            working = 0;
            return;
          }
          else if (keyword == '52列表'){
            var all_key_name = get_key_list(table52);
            console.log(all_key_name);
            await bot.reply(message, all_key_name);
            working = 0;
            return;
          }
        }
        else if (keyword == '社長'){
          var rng_value = Math.floor(Math.random() * 4);
          if (rng_value < 1)
            await bot.reply(message, `https://i.imgur.com/uhsrpJQ.png`);
          else if (rng_value < 2)
            await bot.reply(message, `https://i.imgur.com/jkDFnmt.jpg`);
          else if (rng_value < 3)
            await bot.reply(message, `https://i.imgur.com/6O8Xerj.jpg`);
          else
            await bot.reply(message, `https://i.imgur.com/nze0LHp.jpg`);
          working = 0;
          return;
        }
        else if (keyword == '社長老婆'){
          console.log('社長老婆!')
          var rng_value = Math.floor(Math.random() * 10);
          if (rng_value < 3)
            keyword = '張景嵐';
          else if (rng_value < 6){
            keyword = '大元';
            var rng_value2 = Math.floor(Math.random() * 4);
            if (rng_value2 < 1){
              await bot.reply(message, `https://i.imgur.com/kO87NVp.jpg`);
              working = 0;
              return;
            }
          }
          else
            keyword = '曾智希';
        }
        else if (keyword == '血流成河'){
          await bot.reply(message, `https://i.imgur.com/FrfHotj.jpg`);
          working = 0;
          return;
        }
        else if (keyword == '出處'){
          for (var i = 0;i<last_source.length;i++)
            await bot.reply(message, last_source[i]);
          working = 0;
          return;
        }
        else if (keyword == '日幣'){
          console.log('japan rate');
          var japan_rate = '';
            const got = require('got');

            (async () => {
              try {
                const response = await got("https://rate.bot.com.tw/xrt?Lang=zh-TW");
                console.log(response.body);
                //=> '<!doctype html> ...'
              } catch (error) {
                console.log(error.response.body);
                //=> 'Internal server error ...'
              }
              })();
          await bot.reply(message, japan_rate);
          working = 0;
          return;
        }
        else if (keyword == '關鍵字列表'){
          await bot.reply(message, 'momo ㄇㄇ ㄇㄇ列表 ㄇㄎ 52 52列表 社長 社長老婆 血流成河 出處');
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
        
        // reset lastsource
        last_source = [];
        
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
        var images = find_image(bot, message, result, draw_mode);
        if (images.length > 0){
          var img_url = keyword + '(' + query_count + '/100)\n';
          for (var i = 0;i<images.length;i++){
            img_url = img_url + result[images[i]].url + '\n';
          }
          await bot.reply(message, img_url);
          query_count++;
          fail_count = 0;
        }
        else{
          if (too_many_request == 1){
            fail_count++;
            var rng_value = Math.floor(Math.random() * 10);
            if (fail_count == 1)
              rng_value = 9;
            if (rng_value < 3)
              await bot.reply(message, '阿就說滿了齁');
            else if (fail_count < 5)
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
            var images = find_image(bot, message, result, draw_mode);
            if (images.length > 0){
              var img_url = keyword + '(' + query_count + '/100)\n';
              for (var i = 0;i<images.length;i++){
                img_url = img_url + result[images[i]].url + '\n';
              }
              await bot.reply(message, img_url);
              query_count += 2;
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
      if (last_msg_id.length > 50)
      {
        last_msg_id = [];
      }
    });

    controller.on('message', async(bot, message) => {
        //await bot.reply(message, `Echo: ${ message.text }`);
    });

}