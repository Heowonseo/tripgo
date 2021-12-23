const Sequelize = require('sequelize');

module.exports = class Basket extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
		userId: {
          type: Sequelize.INTEGER(11),
          allowNull: true,
      },
		shopId: {
          type: Sequelize.INTEGER(11),
          allowNull: true,
      },
		quant: {
          type: Sequelize.INTEGER(11),
          allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Basket',
      tableName: 'basket',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
	static associate(db) {
	db.Basket.belongsTo(db.Menu);
  }
}