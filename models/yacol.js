const Sequelize = require('sequelize');

module.exports = class Yacol extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
		driver: {
          type: Sequelize.STRING(10),
          allowNull: true,
      },
		month: {
          type: Sequelize.STRING(15),
          allowNull: true,
      },
		count: {
          type: Sequelize.INTEGER(15),
          allowNull: true,
      },
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'Yacol',
      tableName: 'yacol',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
}