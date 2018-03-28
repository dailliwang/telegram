var crypto = require('crypto');

function commonUtils(){
    this.apikey = "xxxxxxxxxxx";// 短信验证码服务的apikey
    this.text = "[幽兰]您的验证码数: ";
    this.smsUrl = "https://host/api";
    this.suffix = "can_robot";
    this.key = "youlan123";
}
/**
 * 验证手机号码是否合法
 * 是完整的11位手机号或者正确的手机号前七位
 * @param {*} phone
 */
commonUtils.prototype.verifyPhone = function(phone){
    if(!(/^1(3|4|5|7|8)\d{9}$/.test(phone))){ 
        return false; 
    }
    return true;
}

/**
 * 随机生成短信验证码
 */
commonUtils.prototype.generateCode = function(){
    return Math.floor(Math.random()*9000)+1000 + "";
}

/**
 * 验证短信验证码是否正确
 * @param {*} smscode
 */
commonUtils.prototype.verifySmscode = function(smscode, sessioncode){
    console.log("验证码为：",smscode);
    console.log("session验证码为：",sessioncode);
    // 从session中取出验证码 
    if(sessioncode == smscode){
        return true;
    }
    return false;
}

/**
 * 验证imtoken格式是否正确
 * 以太坊地址为42位
 * @param {*} imtoken
 */
commonUtils.prototype.verifyImtoken = function(imtoken){
    console.log("imtoken：",imtoken);
    // TODO
    if(imtoken.length === 3){
        return true;
    }
    return false;
}

/**
 * 获取访问者的ip地址
 */
commonUtils.prototype.getIp = function(req){
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}

/**
 * 按规则生成身份识别码
 * 使用手机号和imtoken一起生成
 */
commonUtils.prototype.generateidentitycode = function(telphone, imtoken){
    var data = telphone + "|" + imtoken;
    const cipher = crypto.createCipher('aes192', this.key);
    var crypted = cipher.update(data, 'utf8', 'base64');
    crypted += cipher.final('base64');
    //crypted = this.URLencode(crypted);
    return crypted;
}

/**
 * 解析身份识别码
 * 屏蔽伪造的邀请码****
 */
commonUtils.prototype.aesidentitycode = function(identitycode){
    //identitycode = this.URLdecode(identitycode);
    try{
        const decipher = crypto.createDecipher('aes192', this.key);
        var decrypted = decipher.update(identitycode, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted.split('|');
    }catch(error){
       // console.log(err);
       //return "非法用户识别码";
       return [];
    }
    
}

/**
 * 按规则生成邀请码
 * 使用2个人的手机号
 * @param telphone1 邀请人
 * @param telphone2 被邀请人
 */
commonUtils.prototype.generateinvitcode = function(telphone1, telphone2){
    var data = telphone1 + "|" + telphone2;
    const cipher = crypto.createCipher('aes192', this.key);
    var crypted = cipher.update(data, 'utf8', 'base64');
    crypted += cipher.final('base64');
    //crypted = this.URLencode(crypted);
    return crypted + this.suffix;
}

/**
 * 解析邀请码invitcode
 */
commonUtils.prototype.aesinvitcode = function(invitcode){
    //invitcode = this.URLdecode(invitcode);
    try {
        const decipher = crypto.createDecipher('aes192', this.key);
        var decrypted = decipher.update(invitcode, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted.split('|');
    } catch (error) {
        //return "非法邀请码";
        return [];
    }
}
/**
 * url转义
 * + " ' /
 */
commonUtils.prototype.URLencode = function(sStr){
    return sStr.replace(/\+/g, '%2B').replace(/\"/g,'%22').replace(/\'/g, '%27').replace(/\//g,'%2F').replace(/\=/g, '%3D');
}

/**
 * url解析
 */
commonUtils.prototype.URLdecode = function(sStr){
    return sStr.replace(/%2B/g, '+').replace(/%22/g,'"').replace(/%27/g, '\'').replace(/%2F/g,'\/').replace(/%3D/g, '\=' );
}


module.exports = new commonUtils();