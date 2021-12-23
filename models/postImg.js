const Sequelize = require('sequelize');

module.exports = class Pimg extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
		src: {
          type: Sequelize.STRING(200),
          allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Pimg',
      tableName: 'Pimg',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
	static associate(db) {
	db.Pimg.belongsTo(db.Post);
  }
}