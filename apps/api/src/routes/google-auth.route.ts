import { Router } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { googleCallback } from '../controllers/google-auth.controller.js'
console.log('Google OAuth config:', {
  clientID: process.env.GOOGLE_CLIENT_ID?.slice(0, 20) + '...',
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
})
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    (_accessToken, _refreshToken, profile, done) => {
      const user = {
        googleId: profile.id,
        email: profile.emails?.[0]?.value ?? '',
        fullName: profile.displayName,
        avatar: profile.photos?.[0]?.value,
      }
      done(null, user)
    }
  )
)

export const googleAuthRouter: Router = Router()

googleAuthRouter.get(
  '/',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
)

googleAuthRouter.get(
  '/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
)