/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var request = require("request");
var cheerio = require("cheerio");
let youtube = require('youtube-search-api');
const got = require("got");
import {ChatGPTUnofficialProxyAPI} from 'chatgpt';
//var ChatGPTUnofficialProxyAPI = require('chatgpt');
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

function query_image_table(table, keyword, input_str){		  
  var key_name = 'p' + input_str;
  if (input_str == keyword){
    var random_item = get_random_item(table);
    return random_item;
  }
  else if (table.hasOwnProperty(key_name)){
    return table[key_name];
  }
  else if (input_str == (keyword + '列表')){
    var all_key_name = get_key_list(table);
    console.log(all_key_name);
    return all_key_name;
  }
  return '';
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
          var tablemomo = new Object();
          tablemomo.pMarine = `宝鐘マリン`;
          tablemomo.pSubaru = `大空スバル`;
          tablemomo.pKiara = `Takanashi Kiara`;
          var result = get_random_item(tablemomo);
          if (result != ''){
            keyword = result;
          }
          else
          {
            keyword = 'sakura momo'
          }
        }
        else if (keyword == '摸摸愛'){
          var tablemomolove = new Object();
          tablemomolove.p = '文詠珊';
          tablemomolove.p = '春夏';
          tablemomolove.p = '采翎';
			    tablemomolove.p = 'Lauren Lapkus';
			    tablemomolove.p = 'Hannah Emily Anderson';
          var result = get_random_item(tablemomolove);
          if (result != ''){
            keyword = result;
          }
        }
        else if (message.text.search('ㄇㄇ') >= 0){
          var tablekeith = new Object();
          tablekeith.pㄇㄇ貓 = `https://i.imgur.com/Adp22A2.jpg`;
          tablekeith.pㄇㄇ北斗 = `https://i.imgur.com/C5gFcE5.png`;
          tablekeith.pㄇㄇ獵人 = `https://i.imgur.com/iPftKTt.png`;
          tablekeith.pㄇㄇ枝枝 = `https://i.imgur.com/X7j7uiV.jpg`;
          
          var result = query_image_table(tablekeith,'ㄇㄇ',keyword);
          if (result != ''){
            await bot.reply(message, result);
            working = 0;
            return;
          }
        }
        else if (message.text.search('電競社') >= 0){
          var tableclesports = new Object();
          tableclesports.p電競社乾杯 = `https://i.imgur.com/haKO8jo.jpg`;
          tableclesports.p電競社全員 = `https://i.imgur.com/aKkp6dV.jpg`;

          var result = query_image_table(tableclesports,'電競社',keyword);
          if (result != ''){
            await bot.reply(message, result);
            working = 0;
            return;
          }
		    }
        else if (message.text.search('ㄇㄎ') >= 0){
          var tablemike = new Object();
          tablemike.pㄇㄎ駁二 = `https://i.imgur.com/vfVs7xB.jpeg`;
          tablemike.pㄇㄎ火災 = `https://i.imgur.com/VVQiBX3.jpg`;
		      tablemike.pㄇㄎ讚 = `https://upload.cc/i1/2021/01/28/pv1oqH.gif`;
          tablemike.pㄇㄎ愛心 = `https://i.imgur.com/gIDON4a.jpeg`;
          
          var result = query_image_table(tablemike,'ㄇㄎ',keyword);
          if (result != ''){
            await bot.reply(message, result);
            working = 0;
            return;
          }
        }
        else if (message.text.search('52') >= 0){
          var table52 = new Object();
          table52.p52躺 = `https://i.imgur.com/h9T5m0e.jpg`;
          table52.p52婷宣 = `https://i.imgur.com/PXRbkFd.jpg`;
          table52.p52枝枝 = `https://i.imgur.com/MrLkboU.jpg`;
          table52.p52枝枝神秘 = `https://i.imgur.com/Zke2Cyl.jpg`;
          table52.p52謎之女 = `https://i.imgur.com/B8niuA4.jpg`;
          table52.p52坐 = `https://i.imgur.com/eyF1PW9.jpg`;
          var result = query_image_table(table52,'52',keyword);
          if (result != ''){
            await bot.reply(message, result);
            working = 0;
            return;
          }
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
        else if (message.text.search('社長') >= 0){
          var tablecheya = new Object();
            tablecheya.p社長持久 = `https://i.imgur.com/uhsrpJQ.png`;
            tablecheya.p社長雙女 = `https://i.imgur.com/jkDFnmt.jpg`;
            tablecheya.p社長剝蝦 = `https://i.imgur.com/6O8Xerj.jpg`;
            tablecheya.p社長拉克絲 = `https://i.imgur.com/nze0LHp.jpg`;
          var result = query_image_table(tablecheya,'社長',keyword);
          if (result != ''){
            await bot.reply(message, result);
            working = 0;
            return;
          }
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
        else if (keyword == '日幣' || keyword == '美金' || keyword == '美元'){
          if (keyword == '美元')
            keyword = '美金';
          console.log('dollar rate');
          var dollar_rate = '';
          const got = require('got');
          
          {
            try {
              const response = await got("https://rate.bot.com.tw/xrt?Lang=zh-TW");
                  //console.log(response.body);
                  var $ = cheerio.load(response.body);
                  var result = [];
                  var titles = $("td.rate-content-cash.text-right.print_hide");
                  //console.log(titles.length);
                  for(var i=0;i<titles.length;i++) {
                    result.push($(titles[i]).text());
                    //console.log(result[i]);
                  }
                  if (keyword == '日幣')
                    dollar_rate = result[15];
                  else if (keyword == '美金')
                    dollar_rate = result[1];
            } catch (error) {
              // Check the code property, and when its a PlatformError, log the whole response.
              console.log(error);
            }
          }
          var output_str = '';
          if (keyword == '日幣')
            output_str = "日幣匯率:" + dollar_rate;
          else if (keyword == '美金')
            output_str = "美金匯率:" + dollar_rate;
          console.log(output_str);
          await bot.reply(message, output_str);
          working = 0;
          return;
        }
        else if (keyword == '關鍵字列表'){
          await bot.reply(message, 'momo 摸摸愛 ㄇㄇ ㄇㄎ 52 社長 人名+列表 社長老婆 血流成河 出處 日幣 美金');
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

    controller.hears(new RegExp(/YT/),'message', async(bot, message) => {
      var youtube_url = "找不到";
      if (message.text.search('YT') != 0)
      {
        return;
      }
      var keyword = message.text.slice(2);
      if (keyword.length == 0)
      {
        await bot.reply(message, "請別抽空字串");
        return;
      }
      console.log('YT keyword: ' + keyword);
      await youtube.GetListByKeyword(keyword,true).then(res=>{
      //console.log("Page1");
      console.log("length:\n");
      console.log(res.items.length);
        
      for (var i=0;i<res.items.length;i++)
      {
        if (res.items[i].type != 'video')
          continue;
        console.log(res.items[i].type);
        console.log(res.items[i].id); //https://www.youtube.com/watch?v=
        youtube_url = 'https://www.youtube.com/watch?v=' + res.items[i].id;
        break;
      }
      return;
        
      }).catch(err=>{
        console.log(err);
      });
      await bot.reply(message, youtube_url);
    });
  
    controller.hears(new RegExp(/什麼是/),'message', async(bot, message) => {
      var wiki_url = "找不到";
      if (message.text.search('什麼是') != 0)
      {
        return;
      }
      var keyword = message.text.slice(3);
      if (keyword.length == 0)
      {
        await bot.reply(message, "請別抽空字串");
        return;
      }
      console.log('keyword: ' + keyword);
      wiki_url = 'https://zh.wikipedia.org/zh-tw/' + keyword;
      try {
        const response = await got(wiki_url);
        //console.log(response.body);
        var $ = cheerio.load(response.body);
        var result = [];
        //var titles = $("td.rate-content-cash.text-right.print_hide");
        //console.log(cheerio.text($('body')));
        await bot.reply(message, wiki_url);
      }
      catch (error) {
              // Check the code property, and when its a PlatformError, log the whole response.
              console.log(error);
        await bot.reply(message, 'wiki沒這東西');
      }
    });
  
  controller.hears(new RegExp(/chat/),'message', async(bot, message) => {
      if (message.text.search('chat') != 0)
      {
        return;
      }
      var keyword = message.text.slice(4);
      if (keyword.length == 0)
      {
        await bot.reply(message, "請別抽空字串");
        return;
      }
      console.log('keyword: ' + keyword);
      const api = new ChatGPTUnofficialProxyAPI({
        accessToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJpY2VzcGlyaXR1YWxAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImdlb2lwX2NvdW50cnkiOiJUVyJ9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsidXNlcl9pZCI6InVzZXItOGNVeFZPUHBpWTNiWkIzamVURHU4N0x4In0sImlzcyI6Imh0dHBzOi8vYXV0aDAub3BlbmFpLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwMjI5NDA4MTM4NjUzODYzODYzMiIsImF1ZCI6WyJodHRwczovL2FwaS5vcGVuYWkuY29tL3YxIiwiaHR0cHM6Ly9vcGVuYWkub3BlbmFpLmF1dGgwYXBwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE2NzgyNTY4OTUsImV4cCI6MTY3OTQ2NjQ5NSwiYXpwIjoiVGRKSWNiZTE2V29USHROOTVueXl3aDVFNHlPbzZJdEciLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG1vZGVsLnJlYWQgbW9kZWwucmVxdWVzdCBvcmdhbml6YXRpb24ucmVhZCBvZmZsaW5lX2FjY2VzcyJ9.nCt55fOFlGtL7EfERUAAlfJRkNCCy8C-wi01VT2PLzG6Xwofnf06jMjm0Z0UqiwRI851OttCELP371ORttzlP7H9xj68LpWSVJbZYdMFwzQrwWms72QNAtE9wJmvkM_xOnCiCYL1mC997YuQPzRIb0kKHUPQfa_jAi0GKGboWutReovklbM6wKmYWgtOWDm1jkaGvJ4hXxiNqJkK6PtUtf-riIVl9Cx3JJmiR0QjqBw8qcmOeyfPCq42kZTBk8Tz-EQEFC_aT_yA35HXyxkUE3wRdklv5EVZUSYl5nbf5yclqc1AK5bK90G3evYXbUfqvRnTunP6kLHlJajMhFPuBg"
      })

      const res = await api.sendMessage(keyword)
      await bot.reply(message, res.text);
      
    });

}