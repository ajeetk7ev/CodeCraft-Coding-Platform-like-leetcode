import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user/User";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const googleEmail = profile.emails?.[0]?.value;
          if (!googleEmail) {
            return done(
              new Error("No email found in Google profile"),
              undefined,
            );
          }
          const email: string = googleEmail;
          const userPrefix = email.split("@")[0] || "user";
          user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              fullName: profile.displayName,
              username: userPrefix + Math.floor(Math.random() * 1000),
              email: email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value || "",
            });
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
