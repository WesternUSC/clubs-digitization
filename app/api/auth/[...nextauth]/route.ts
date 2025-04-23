import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'

const AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID!
const AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET!

const allowedEmails =  [
    "manav.sharma@westernusc.ca",
    "gpimlatt@westernusc.ca",
    "eric.svechnikov@westernusc.ca",
    "shari.bumpus@westernusc.ca",
    "anna.pavicic@westernusc.ca",
    "karen.savino@westernusc.ca",
    "clubs.calendar@westernusc.ca",
]

const authOption: NextAuthOptions = {
    session: {
        strategy: 'jwt'
    },
    providers: [
        GoogleProvider({
            clientId: AUTH_GOOGLE_ID,
            clientSecret: AUTH_GOOGLE_SECRET
        })
    ],
    callbacks: {
        async signIn({ user }) {
            if (user.email && allowedEmails.includes(user.email)){
                return true
            } else {
                return false
            }
        },
    },
}

const handler = NextAuth(authOption)
export { handler as GET, handler as POST}
