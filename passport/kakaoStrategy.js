const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_ID,
    callbackURL: 'https://tripple.run.goorm.io/auth/kakao/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    console.log('kakao profile', profile);
    try {
      const exUser = await User.findOne({
        where: { snsId: profile.id },
      });
      if (exUser) {
		  
		await User.update({
			nick : profile._json.properties.nickname,
			profileImg : profile._json.properties.profile_image
		}, {where: { snsId: profile.id }});
		  
		const exUsers = await User.findOne({
        where: { snsId: profile.id },
      });
		  
		  done(null, exUsers);
      } else {
        const newUser = await User.create({
          snsId: profile.id,
		  nick : profile._json.properties.nickname,
		  profileImg : profile._json.properties.profile_image
        });
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};