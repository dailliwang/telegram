const express = require('express');
const commonUtils = require("../utils/commonUtils");
const router = express.Router();

const Player = require('../schemaDao/Player');
const Promise = require('promise');

const replyrobot = require('../utils/replyrobot');


/**
 * /robot
 * 解析邀请码
 */
router.post('/', function(req, res, next) {
    console.log(req.body.message);
  // 获取邀请码
  let invitcode = req.body.message.text;
  let chatid = req.body.message.chat.id;
  if(invitcode && invitcode.endsWith(commonUtils.suffix)){
    // 解析邀请码
    let player12 = commonUtils.aesinvitcode(invitcode);
    if(player12.length === 2) {//解析成功
        // player12[0] 邀请人
        // player12[1] 被邀请人
        // 1、检测验证码是否已经被使用
        let query = {
            invitcode: invitcode
        }
        Player.findOne(query, function(err, player){
            if(!err && player){
                let reward = 0;
                if(player.invitcount <= 30){
                    reward = commonUtils.oneReward;
                }else if(player.invitcount <= 100){
                    reward = commonUtils.twoReward;
                }else {
                    reward = commonUtils.threeReward;
                }
                if(!player.isusedinvit){ // 邀请码没有被使用
                    // 邀请人发奖励，修改邀请的人数，将被邀请人写入邀请人的队列
                    let p1 = new Promise(function(resolve, reject){
                        Player.updateOne({
                            "telphone": player12[0]
                        },{
                            "$inc": {
                                totalcancount: reward,
                                invitcount: 1 // 邀请的人数+1
                            },
                            "$push": {
                                invitedplayers: player12[1]
                            }
                    },function(err, c){
                            resolve(c);
                        });
                    });
                    // 被邀请人发奖励
                    let p2 = new Promise(function(resolve, reject){
                        Player.updateOne({
                            "telphone": player12[1]
                        },{"$inc": {
                            totalcancount: commonUtils.oneReward
                        }},function(err, c){
                            resolve(c);
                        });
                    });
                    // 将邀请码设为已经使用
                    let p3 = new Promise(function(resolve, reject){
                        Player.updateOne({
                            invitcode: invitcode
                        },{
                            $set: {isusedinvit: true}
                        },function(err, c){
                            resolve(c);
                        })
                    });
                    let p = Promise.all([p1, p2, p3]);
                    p.then(function(val){
                        console.log("奖励已发放");
                        replyrobot(chatid, "奖励已发放",function(val){
                            res.end(val);
                        });
                        //res.json({code: 200, msg: "奖励已发放"});
                    }).catch(function(err){
                        console.log("奖励发放失败");
                        replyrobot(chatid, "奖励发放失败",function(val){
                            res.end(val);
                        });
                    });
                }else{
                    // 邀请码已经被使用
                    console.log("邀请码已经被使用");
                    replyrobot(chatid, "邀请码已经被使用",function(val){
                        res.end(val);
                    });
                }
            }else{
                console.log("邀请码查询无效");
                replyrobot(chatid, "邀请码查询无效",function(val){
                    res.end(val);
                });
            }
        });
        }else {
            // 邀请码无效
            console.log("邀请码无效");
            replyrobot(chatid, "邀请码无效",function(val){
                res.end(val);
            });
        }
    }else{
        console.log("不进行处理");
        replyrobot(chatid, "你是来搞笑的吗",function(val){
            res.end(val);
        });
        //res.end();
    }
});

module.exports = router;