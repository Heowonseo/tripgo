const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
		score: {
          type: Sequelize.STRING(40),
          allowNull: true,
      },
		content: {
          type: Sequelize.STRING(300),
          allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Post',
      tableName: 'post',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
static associate(db) {
	db.Post.belongsTo(db.User);
	db.Post.belongsTo(db.Shop);
    db.Post.hasMany(db.Pimg);
	db.Post.belongsToMany(db.User, {
		through: 'LikePost',
		foreignKey: 'likerId',
      	as: 'Liked', 
	});
	db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
  }
}

