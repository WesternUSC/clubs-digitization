import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'

const AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID!
const AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET!

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
}

const handler = NextAuth(authOption)
export { handler as GET, handler as POST}
