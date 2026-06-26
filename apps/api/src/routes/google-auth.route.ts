import 'dotenv/config'
import { Router } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { googleCallback, completeGoogleSignup } from '../controllers/google-auth.controller.js' // ← add completeGoogleSignup

export const googleAuthRouter: Router = Router()

function initGoogleStrategy() {
  const clientID = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const callbackURL = process.env.GOOGLE_CALLBACK_URL

  if (!clientID || !clientSecret || !callbackURL) {
    console.error('❌ Google OAuth env vars missing:', { clientID: !!clientID, clientSecret: !!clientSecret, callbackURL })
    return
  }

  console.log('✅ Google OAuth initialized with client:', clientID.slice(0, 20) + '...')

  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
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
}

initGoogleStrategy()

googleAuthRouter.get(
  '/',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

googleAuthRouter.get(
  '/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
)

googleAuthRouter.post('/complete-signup', completeGoogleSignup) // ← ADD