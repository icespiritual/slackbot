/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { SlackDialog } = require('botbuilder-adapter-slack');
var player_list = new Object();
var game = new Object();
var game_start = false;
var cur_handler = main_menu;
var cur_display = '眾多冒險者都想探索這座迷宮... \n 1:開始遊戲 2:載入進度';
var blackline = ':black_square::black_square::black_square::black_square::black_square:\n';
var emoji_table = [':white_square:',':black_square:',':white_haired_woman:'];
var dungeon_map = [[1,1,0,1,1],
                 [1,1,0,1,1],
                 [1,0,0,1,1],
                 [1,1,0,1,1],
                 [1,1,0,1,1]];
var dungeon_height = dungeon_map.length;
var dungeon_width = dungeon_map[0].length;
var final_map = [[1,1,0,1,1],
                 [1,1,0,1,1],
                 [1,0,0,1,1],
                 [1,1,0,1,1],
                 [1,1,0,1,1]];  // with hero/monsters/...
var dungeon_map_show = blackline + blackline + blackline + blackline + blackline;
function generate_dungeon_map_show(dun_map){
  dungeon_map_show = '';
  for (var j=0;j<dungeon_height;j++){
    for (var i=0;i<dungeon_width;i++){
        dungeon_map_show += emoji_table[dun_map[j][i]];
    }
    dungeon_map_show += '\n';
  }
}

var hero = new Object();
hero.x = 2;
hero.y = 0;
function move_hero(myhero, input, dun_map, width, height){
  if (input == 'w'){
    if (myhero.y < height - 1 && dun_map[height - myhero.y - 2][myhero.x] == 0)
      myhero.y += 1;
  }
  else if (input == 'a'){
    if (myhero.x > 0  && dun_map[height - myhero.y - 1][myhero.x - 1] == 0)
      myhero.x -= 1;
  }
  else if (input == 's'){
    if (myhero.y > 0  && dun_map[height - myhero.y][myhero.x] == 0)
      myhero.y -= 1;
  }
  if (input == 'd'){
    if (myhero.x < width - 1 && dun_map[height - myhero.y - 1][myhero.x + 1] == 0)
      myhero.x += 1;
  }  
}

function compose_final_map(dungeon_map, myhero, final_result){
  for (var j=0;j<dungeon_height;j++){
    for (var i=0;i<dungeon_width;i++){
      final_result[j][i] = dungeon_map[j][i];
    }
  }
  console.log('myhero:');
  console.log(myhero);
  //console.log(myhero.x >= 0 , myhero.x < dungeon_width, myhero.y >= 0, myhero.y < dungeon_height);
  if (myhero.x >= 0 && myhero.x < dungeon_width && myhero.y >= 0 && myhero.y < dungeon_height){
    final_result[dungeon_height - myhero.y - 1][myhero.x] = 2; // 2 is hero
    console.log('actual move');
  }
  else{
    console.log('not move');
  }
  //console.log(final_result);
}

function main_menu(input){
  if (input == 1){
    cur_handler = village;
    cur_display = '1:進入迷宮 2:商店 3:旅館';
  }
}

function village(input){
  if (input == 1){
    cur_handler = dungeon;
    cur_display = '你進入了迷宮... \n 1. 確定 2. 重來'
  }
}

function dungeon(input){
  if (input == 1){
    // do nothing
  }
  if (input == 2){
    cur_handler = main_menu;
    cur_display = '眾多冒險者都想探索這座迷宮... \n 1:開始遊戲 2:載入進度';
  }
  else{
    move_hero(hero, input, dungeon_map, dungeon_width, dungeon_height);
    console.log(hero.x, hero.y);
  }
  //console.log(final_map);
  compose_final_map(dungeon_map, hero, final_map);
  //console.log(final_map);
  generate_dungeon_map_show(final_map);
  cur_display = dungeon_map_show + 'w:上, a:左 s:下 d:右';
}

module.exports = function(controller) {

    controller.ready(async () => {
        if (process.env.MYTEAM) {
            let bot = await controller.spawn(process.env.MYTEAM);
            await bot.startConversationInChannel(process.env.MYCHAN,process.env.MYUSER);
            bot.say('I AM AWOKEN.');
        }
    });

    controller.on('direct_message', async(bot, message) => {
      if (message.text == 'momoquest'){
        console.log(message.user);
        if (player_list.hasOwnProperty(message.user)){
          await bot.reply(message,'已經開始遊戲囉');
        }
        else{
          player_list[message.user] = new Object();
          game_start = true;
          cur_handler(message.text);
          await bot.reply(message,cur_display);
        }
      }
      else if (game_start){
        cur_handler(message.text);
        await bot.reply(message,cur_display);
      }
      else
      {
        await bot.reply(message,'未開始遊戲');
      }
    });

    controller.hears('dm me', 'message', async(bot, message) => {
        await bot.startPrivateConversation(message.user);
        await bot.say(`1:開始遊戲 2:載入進度`);
    });

    controller.on('direct_mention', async(bot, message) => {
        await bot.reply(message, `I heard a direct mention that said "${ message.text }"`);
    });

    controller.on('mention', async(bot, message) => {
        await bot.reply(message, `You mentioned me when you said "${ message.text }"`);
    });

    controller.hears('ephemeral', 'message,direct_message', async(bot, message) => {
        await bot.replyEphemeral(message,'This is an ephemeral reply sent using bot.replyEphemeral()!');
    });

    controller.hears('threaded', 'message,direct_message', async(bot, message) => {
        await bot.replyInThread(message,'This is a reply in a thread!');

        await bot.startConversationInThread(message.channel, message.user, message.incoming_message.channelData.ts);
        await bot.say('And this should also be in that thread!');
    });

    /*controller.hears('blocks', 'message', async(bot, message) => {

        await bot.reply(message,{
            blocks: [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Hello, Assistant to the Regional Manager Dwight! *Michael Scott* wants to know where you'd like to take the Paper Company investors to dinner tonight.\n\n *Please select a restaurant:*"
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Farmhouse Thai Cuisine*\n:star::star::star::star: 1528 reviews\n They do have some vegan options, like the roti and curry, plus they have a ton of salad stuff and noodles can be ordered without meat!! They have something for everyone here"
                    },
                    "accessory": {
                        "type": "image",
                        "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/c7ed05m9lC2EmA3Aruue7A/o.jpg",
                        "alt_text": "alt text for image"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Kin Khao*\n:star::star::star::star: 1638 reviews\n The sticky rice also goes wonderfully with the caramelized pork belly, which is absolutely melt-in-your-mouth and so soft."
                    },
                    "accessory": {
                        "type": "image",
                        "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/korel-1YjNtFtJlMTaC26A/o.jpg",
                        "alt_text": "alt text for image"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Ler Ros*\n:star::star::star::star: 2082 reviews\n I would really recommend the  Yum Koh Moo Yang - Spicy lime dressing and roasted quick marinated pork shoulder, basil leaves, chili & rice powder."
                    },
                    "accessory": {
                        "type": "image",
                        "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/DawwNigKJ2ckPeDeDM7jAg/o.jpg",
                        "alt_text": "alt text for image"
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Farmhouse",
                                "emoji": true
                            },
                            "value": "Farmhouse"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Kin Khao",
                                "emoji": true
                            },
                            "value": "Kin Khao"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Ler Ros",
                                "emoji": true
                            },
                            "value": "Ler Ros"
                        }
                    ]
                }
            ]
        });

    });*/
    controller.hears('testblock', 'message', async(bot, message) => {
      await bot.reply(message,{
              blocks: [
                {
                  "type": "image",                 
                  "image_url": "https://pbs.twimg.com/media/Ej9Z9ZHUYAAxyQE.jpg",
                  "alt_text": "An incredibly cute kitten."
                },
              ]
        });
    });
    controller.on('block_actions', async (bot, message) => {
        await bot.reply(message, `Sounds like your choice is ${ message.incoming_message.channelData.actions[0].value }`)
    });

    controller.on('slash_command', async(bot, message) => {
        if (message.text === 'plain') {
            await bot.reply(message, 'This is a plain reply');
        } else if (message.text === 'public') {
            await bot.replyPublic(message, 'This is a public reply');
        } else if (message.text === 'private') {
            await bot.replyPrivate(message, 'This is a private reply');
        }

        // set http status
        bot.httpBody({text:'You can send an immediate response using bot.httpBody()'});

    });

    controller.on('interactive_message', async (bot, message) => {

        console.log('INTERACTIVE MESSAGE', message);

        switch(message.actions[0].name) {
            case 'replace':
                await bot.replyInteractive(message,'[ A previous message was successfully replaced with this less exciting one. ]');
                break;
            case 'dialog':
                await bot.replyWithDialog(message, new SlackDialog('this is a dialog', '123', 'Submit', [
                    {
                        type: 'text',
                        label: 'Field 1',
                        name: 'field1',
                    },
                    {
                        type: 'text',
                        label: 'Field 2',
                        name: 'field2',
                    }
                ]).notifyOnCancel(true).state('foo').asObject());
                break;
            default:
                await bot.reply(message, 'Got a button click!');
        }
    });


    controller.on('dialog_submission', async (bot, message) => {
        await bot.reply(message, 'Got a dialog submission');

        // Return an error to Slack
        bot.dialogError([
            {
                "name": "field1",
                "error": "there was an error in field1"
            }
        ])
    });

    controller.on('dialog_cancellation', async (bot, message) => {
        await bot.reply(message, 'Got a dialog cancellation');
    });

}