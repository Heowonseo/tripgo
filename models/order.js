const Sequelize = require('sequelize');

module.exports = class Order extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
		nick: {
          type: Sequelize.STRING(10),
          allowNull: true,
      },
		phone: {
          type: Sequelize.STRING(40),
          allowNull: true,
      },
		total: {
          type: Sequelize.INTEGER,
          allowNull: true,
      },
		order: {
          type: Sequelize.STRING(300),
          allowNull: true,
      },
		arrive: {
          type: Sequelize.STRING(50),
          allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Order',
      tableName: 'orders',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
	static associate(db) {
	db.Order.belongsTo(db.Shop);
  }
}