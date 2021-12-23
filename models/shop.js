const Sequelize = require('sequelize');

module.exports = class Shop extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      	label: {
          type: Sequelize.STRING(40),
          allowNull: true,
      },
		x: {
          type: Sequelize.DOUBLE,
          allowNull: true,
      },
		y: {
          type: Sequelize.DOUBLE,
          allowNull: true,
      },
		phone: {
          type: Sequelize.STRING(200),
          allowNull: true,
      },
		road_address: {
          type: Sequelize.STRING(200),
          allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Shop',
      tableName: 'shop',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
	static associate(db) {
	db.Shop.hasMany(db.Simg);
	db.Shop.hasMany(db.Post);
	db.Shop.hasMany(db.Menu);
	db.Shop.hasMany(db.Order);
	db.Shop.belongsToMany(db.User, {
		through: 'InterestShop',
		foreignKey: 'interesterId',
      	as: 'Interested', 
	});
  }
}

