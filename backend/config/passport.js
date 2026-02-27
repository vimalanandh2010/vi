const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { isPublicEmail, extractDomain } = require('../utils/dnsUtils');

passport.use(
    new GoogleStrategy(
        {
            clientID: (process.env.GOOGLE_CLIENT_ID || '').trim(),
            clientSecret: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),
            callbackURL: `${(process.env.BACKEND_URL || 'http://localhost:5000').trim()}/api/auth/google/callback`,
            passReqToCallback: true,
            proxy: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
            console.log('--- Passport Google Handshake Start ---');
            console.log('Profile ID:', profile.id);
            console.log('Profile Email:', profile.emails?.[0]?.value);

            const state = req.query.state;
            console.log(`[Passport] Google Strategy Callback. State: ${state}`);

            let role = 'seeker'; // Default
            if (state) {
                if (state.includes('employer') || state === 'employer') {
                    role = 'employer';
                } else if (state.includes('seeker') || state === 'seeker') {
                    role = 'seeker';
                }
            }

            console.log(`[Passport] Authenticating user with role: ${role}`);

            try {
                if (!profile.emails || profile.emails.length === 0) {
                    return done(new Error('No email found in Google profile'), null);
                }
                const email = profile.emails[0].value.toLowerCase().trim();

                // Domain restriction for recruiters
                if (role === 'employer') {
                    const domain = extractDomain(email);
                    if (isPublicEmail(domain)) {
                        console.warn(`[Passport] Blocking Google login for recruiter with public email: ${email}`);
                        return done(null, false, { message: 'Recruiters must use a company email address.' });
                    }
                }

                let user = await User.findOne({ googleId: profile.id, role: role });
                if (user) {
                    console.log(`[Passport] Found existing user [${user._id}] with DB role [${user.role}]. Intended role: [${role}]`);
                    user.intendedRole = role; // Attach for the JWT step
                    return done(null, user);
                }

                // Check if email exists (any role)
                user = await User.findOne({ email });

                if (user) {
                    console.log(`[Passport] Email [${email}] matched existing account with role [${user.role}]. Linking with Google and using intended role: [${role}]`);
                    user.googleId = profile.id;
                    user.authProvider = 'google';
                    user.isEmailVerified = true;
                    if (!user.photoUrl) user.photoUrl = profile.photos?.[0]?.value || '';
                    user.intendedRole = role; // Attach for the JWT step
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                const newUser = new User({
                    firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
                    lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
                    email: email,
                    googleId: profile.id,
                    role: role,
                    authProvider: 'google',
                    isEmailVerified: true,
                    photoUrl: profile.photos?.[0]?.value || ''
                });

                console.log(`[Passport] Creating NEW ${role} user: ${email}`);
                await newUser.save();
                newUser.intendedRole = role;
                return done(null, newUser);

            } catch (err) {
                console.error('!!! [Passport] Handshake Error Catch Block !!!');
                console.error('Error Name:', err.name);
                console.error('Error Message:', err.message);
                if (err.stack) console.error('Stack Trace:', err.stack);
                return done(err, null);
            }
        }
    )
);

module.exports = passport;
