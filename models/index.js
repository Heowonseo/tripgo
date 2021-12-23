const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Shop = require('./shop');
const Simg = require('./shopImg');
const Post = require('./post');
const Pimg = require('./postImg');
const Hashtag = require('./hashtag');
const Menu = require('./menu');
const Basket = require('./basket');
const Order = require('./order');
const Hapdong = require('./hapdong');
const Yacol = require('./yacol');
const Jumal = require('./jumalcol');
const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Shop = Shop;
db.Simg = Simg;
db.Post = Post;
db.Pimg = Pimg;
db.Hashtag = Hashtag;
db.Menu = Menu;
db.Basket = Basket;
db.Order = Order;
db.Hapdong = Hapdong;
db.Yacol = Yacol;
db.Jumal = Jumal;

User.init(sequelize);
Shop.init(sequelize);
Simg.init(sequelize);
Post.init(sequelize);
Pimg.init(sequelize);
Hashtag.init(sequelize);
Menu.init(sequelize);
Basket.init(sequelize);
Order.init(sequelize);
Hapdong.init(sequelize);
Yacol.init(sequelize);
Jumal.init(sequelize);

User.associate(db);
Shop.associate(db);
Simg.associate(db);
Post.associate(db);
Pimg.associate(db);
Hashtag.associate(db);
Menu.associate(db);
Basket.associate(db);
Order.associate(db);

module.exports = db;
