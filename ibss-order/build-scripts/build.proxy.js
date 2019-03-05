 // var url = 'http://10.112.32.9/';
 var IP_112 = 'http://10.112.32.9', IP_113 = 'http://10.113.32.9:10240';
 var url = IP_112;
 // var url = 'http://hj.ceshi113.com/';
 module.exports = {
     // URL 匹配规则
     '/g/api/': {
         // 目标机器 IP
         target: url,
         // URL 重写
         //pathRewrite: {'^/api': ''},
         // 是否使用 Https
         // secure: false
     },
     '/am/api/': {
         target: url,
     },
     '/storage/': {
         target: url,
     },
     '/op/api/': {
         target: url,
     },
     '/orm/api/': {
         target: url,
     },
     '/odr/api/': {
         target: url,
     },
     '/em/api/': {
         target: url,
     },
     '/shiro-cas': {
         target: url,
         pathRewrite: { '^/': '/sp/' }
     }
 };