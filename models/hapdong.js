const Sequelize = require('sequelize');

module.exports = class Hapdong extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
		when: {
          type: Sequelize.STRING(10),
          allowNull: true,
      },
		schedule: {
          type: Sequelize.STRING(20),
          allowNull: true,
      },
      	applicant: {
          type: Sequelize.STRING(10),
          allowNull: true,
      },
		driver: {
          type: Sequelize.STRING(10),
          allowNull: true,
      },
		date: {
          type: Sequelize.STRING(15),
          allowNull: true,
      },
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'Hapdong',
      tableName: 'hap',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
}