import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const googleAvatar = profile.photos?.[0]?.value || null;

          let user = await User.findOne({ email });

          if (user) {
            let changed = false;

            // FIX: Save googleId if missing
            if (!user.googleId) {
              user.googleId = profile.id;
              changed = true;
            }

            // FIX: Save avatar from Google if user has no avatar yet
            if (!user.avatar && googleAvatar) {
              user.avatar = googleAvatar;
              changed = true;
            }

            if (changed) await user.save();

          } else {
            user = await User.create({
              name:     profile.displayName,
              email,
              googleId: profile.id,
              avatar:   googleAvatar,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

export default passport;