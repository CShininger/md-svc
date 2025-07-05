// MongoDB 初始化脚本
db = db.getSiblingDB('markdown_db');

// 创建应用用户
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'markdown_db'
    }
  ]
});

// 创建 markdowns 集合
db.createCollection('markdowns');

// 创建索引
db.markdowns.createIndex({ "title": 1 });
db.markdowns.createIndex({ "createdAt": -1 });
db.markdowns.createIndex({ "updatedAt": -1 });

print('数据库初始化完成'); 