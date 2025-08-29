import type { useMembers } from "@/store/servers";
import type { User } from "@/types/User";

export const updateUserInAllGuilds = (
	updatedUser: User,
	members: ReturnType<typeof useMembers.getState>,
	currentUserId: string,
) => {
	Object.entries(members.data).forEach(([guildId, guildMembers]) => {
		const currentUserMember = guildMembers.find(
			(m) => m.user.id === currentUserId,
		);
		if (currentUserMember) {
			members.updateMember(guildId, {
				...currentUserMember,
				user: {
					...currentUserMember.user,
					...updatedUser,
				},
			});
		}
	});
};
