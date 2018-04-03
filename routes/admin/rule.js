const express = require('express');
const router = express.Router();
const Replyrule = require('../../schemaDao/Replyrule');
const mongoose = require('mongoose');

/**
 * 每次启动从数据库中加载回复规则
 * 从数据库中读取回复规则进行global缓存
 * 每次进行后台操作的时候，更新这个replyrules
 */
global.replyrules = new Map();
(function readDbCache(){
    Replyrule.find({
        //status: 0
    }, function(err, replyrules){
        if(!err && replyrules){
            replyrules.forEach(rule => {
                global.replyrules.set(rule.id, rule);
            });
        }
    });
})();

// 添加回复规则
// 向缓存中添加规则
router.post('/add', function(req, res, next){
   // 规则名称
   let rulename = req.body.rulename;
   if(!rulename){
       res.json({code: 201, msg: '规则名称不能为空'});
       return;
   }
   // 关键词
   let keywords = req.body.keywords;
   if(!keywords){
       res.json({code: 201, msg: '关键词不能为空'});
       return;
   }
   keywords = keywords.split(',');
   // 回复内容
   let replycontent = req.body.replycontent;
   if(!replycontent){
       res.json({code: 201, msg: '回复内容不能为空'});
       return;
   }
  
   let obj = {
    rulename: rulename,
    keywords: keywords,
    replycontent: replycontent
   };
   Replyrule.create(obj, function(err, replyrules){
        if(!err && replyrules){
            // 添加到global缓存
            global.replyrules.set(replyrules._id, replyrules);
            res.json({code: 200, msg: '添加成功'});
        }else{
            res.json({code: 201, msg: '添加失败'});
        }
   });
});
// 修改规则状态
router.get('/editstatus', function(req, res, next){
    let id = req.query.id;
    let status = req.query.status;
    if(!id){
        res.json({code: 201, msg: 'id不能为空'});
        return;
    }
    if(!status){
        res.json({code: 201, msg: '状态不能为空'});
        return;
    }

    Replyrule.updateById(mongoose.Types.ObjectId(id), {
        $set: {
            status: status
        }
    }, function(err, c){
        if(!err && c){
            // 修改global缓存
            global.replyrules.get(id).status = status;
            
            res.json({code: 200, msg: '修改成功'});
        }else{
            res.json({code: 201, msg: '修改失败'});
        }
    });
});

// 编辑已有规则
router.get('/editother', function(req, res, next){
    let id = req.query.id;
    delete req.query.id;
    Replyrule.updateById(mongoose.Types.ObjectId(id), {
        $set: req.query
    },function(err, c){
        if(!err && c){
            let item = global.replyrules.get(id);
            let keys = Object.keys(req.query);
            keys.forEach(function(key){
                item[key] = req.query[key];
            });
            console.log(global.replyrules);
            //global.replyrules.get(id).status = status;
            res.json({code: 200, msg: '更新成功'});
        }else {
            res.json({code: 201, msg: '更新失败'});
        }
    });
    
});

module.exports = router;