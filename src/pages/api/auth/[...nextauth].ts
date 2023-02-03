import NextAuth from 'next-auth';
import DiscordProvider, { DiscordProfile } from 'next-auth/providers/discord';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../lib/prisma';

export default NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		DiscordProvider({
			clientId: process.env.DISCORD_CLIENT_ID,
			clientSecret: process.env.DISCORD_CLIENT_SECRET,
			token: 'https://discord.com/api/oauth2/token',
			userinfo: 'https://discord.com/api/users/@me',
			authorization: {
				params: {
					scope: 'identify email guilds guilds.members.read',
				},
			},
		}),
	],
	session: {},
	callbacks: {
		async signIn({ user, account, profile, email, credentials }) {
			const verifiedRoleId = '1067919849399009373';
			let retVal: boolean | string = '/';

			if (account) {
				await fetch(`https://discord.com/api/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${account.access_token}`,
					},
				}).then((res) =>
					res.json().then((data) => {
						if (data) {
							if (data.roles.includes(verifiedRoleId)) {
								user.roles = data.roles;
								retVal = true;
							}
						}
					})
				);
			}

			return retVal;
		},
		// async jwt({ token, account, profile }) {
		// 	if (account) {
		// 		token.accessToken = account.access_token;
		// 	}

		// 	return token;
		// },
		async session({ session, token, user }) {
			const account = await prisma.account.findFirst({
				where: {
					userId: user.id,
				},
			});

			if (account) {
				await fetch(`https://discord.com/api/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${account.access_token}`,
					},
				}).then((res) =>
					res.json().then((data) => {
						if (data) {
							session.user.roles = data.roles;
						}
					})
				);
			}

			return session;
		},
	},
});
