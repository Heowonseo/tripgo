const Sequelize = require('sequelize');

module.exports = class Menu extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
		src: {
          type: Sequelize.STRING(200),
          allowNull: true,
      },
		label: {
          type: Sequelize.STRING(40),
          allowNull: true,
      },
		price: {
          type: Sequelize.INTEGER,
          allowNull: true,
      },
		description: {
          type: Sequelize.STRING(300),
          allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Menu',
      tableName: 'Menu',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
	static associate(db) {
	db.Menu.belongsTo(db.Shop);
	db.Menu.hasMany(db.Basket);
  }
}