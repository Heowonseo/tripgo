const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      	snsId: {
          type: Sequelize.STRING(40),
          allowNull: true,
          unique: true,
      },
		nick: {
          type: Sequelize.STRING(40),
          allowNull: true,
      },
		profileImg: {
          type: Sequelize.STRING(200),
          allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'User',
      tableName: 'user',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
	static associate(db) {
	db.User.hasMany(db.Post);
    db.User.belongsToMany(db.User, {
      foreignKey: 'followingId',
      as: 'Followers',
      through: 'Follow',
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'followerId',
      as: 'Followings',
      through: 'Follow',
    });
	db.User.belongsToMany(db.Post, {
		through: 'LikePost',
		foreignKey: 'likedId',
      	as: 'Liker', 
	});
	db.User.belongsToMany(db.Shop, {
		through: 'InterestShop',
		foreignKey: 'interestedId',
      	as: 'Interester', 
	});
  }
}

