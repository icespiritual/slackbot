/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = function(controller) {

    // use a function to match a condition in the message
    controller.hears(async(message) => message.text && message.text.toLowerCase() === 'foo', ['message'], async (bot, message) => {
        await bot.reply(message, 'I heard "foo" via a function test'  + '(' + 33 + '/100)\n');
        console.log(controller.webserver.team);
      var minutes = 1000 * 60;
      var hours = minutes * 60;
      var days = hours * 24;
      var years = days * 365;
      var d = new Date();
      var t = d.getTime();

      var x = Math.round(t / minutes);
      x = x % 60;
      var y = Math.round(t / hours);
      y = y % 24;
      console.log(x);
      console.log(y);
      var kkk = new StoreItem();
      var kkk.eTag = 'someTopic';
      controller.storage.write({ 'superkkk': kkk });
      //var items = controller.storage.read('botState');
      //console.log(items);
      //var beans = {id: 'cool', beans: 'garbanzo'};
      //controller.storage.write(beans);
      //var newbeans = controller.storage.read('cool');
      //console.log(newbeans);
      //controller.storage.teams.save({id: message.team, foo:'bar'}, function(err) {  });
      //controller.storage.teams.get(message.team, function(err, foo) {console.log(foo);});
    });

    // use a regular expression to match the text of the message
    //controller.hears(new RegExp(/^\d+$/), ['message','direct_message'], async function(bot, message) {
    //    await bot.reply(message,{ text: 'I heard a number using a regular expression.' });
    //});

    // match any one of set of mixed patterns like a string, a regular expression
    //controller.hears(['allcaps', new RegExp(/^[A-Z\s]+$/)], ['message','direct_message'], async function(bot, message) {
    //    await bot.reply(message,{ text: 'I HEARD ALL CAPS!' });
    //});

}