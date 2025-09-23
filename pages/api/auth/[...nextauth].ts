import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const adminEmails = [
  'kamalusosanjose@gmail.com',
  'martinfernandocedres@gmail.com',
  'katherinesilvalong@gmail.com',
]

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.email) {
        token.id = user.id
        if (adminEmails.includes(user.email)) {
          token.role = 'admin'
        } else {
          token.role = 'user'
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
})
