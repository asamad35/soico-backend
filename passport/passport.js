const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserSchema = require("../models/userModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      // console.dir(profile, { depth: null });

      let user = await UserSchema.findOne({
        email: profile?.emails[0]?.value,
      });
      // console.log({ user });
      if (!user)
        user = await UserSchema.create({
          firstName: profile?.name?.givenName,
          lastName: profile?.name?.familyName,
          email: profile?.emails[0]?.value,
          password: process.env.THIRD_PARTY_PASS,
          confirmPassword: process.env.THIRD_PARTY_PASS,
          photoUrl: profile?.photos[0]?.value,
          loggedInWithThirdParty: true,
        });

      return done(null, { ...profile, accessToken });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
