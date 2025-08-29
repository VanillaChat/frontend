import { nanoid } from "nanoid";
import React, { useState } from "react";
import Button from "@/components/UI/Button";
import Input from "@/components/UI/Input";
import { MarkdownRenderer } from "@/components/UI/MarkdownRenderer";
import Modal from "@/components/UI/Modal";
import { useMembers } from "@/store/servers";
import { useSession } from "@/store/session";
import { updateUserInAllGuilds } from "@/utils/updateUserInAllGuilds";

export default function ProfileEditModal() {
	const session = useSession();
	const members = useMembers();
	const [openEditModal, setOpenEditModal] = React.useState(false);
	const [username, setUsername] = useState(session.currentUser?.username ?? "");
	const [tag, setTag] = useState(session.currentUser?.tag ?? "");
	const [bio, setBio] = useState(session.currentUser?.bio ?? "");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validate = () => {
		const newErrors: { username?: string; tag?: string; password?: string } =
			{};

		if (!username?.trim()) {
			newErrors.username = "Username is required";
		} else if (username.length < 2) {
			newErrors.username = "Username must be at least 2 characters";
		} else if (username.length > 32) {
			newErrors.username = "Username cannot exceed 32 characters";
		} else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
			newErrors.username =
				"Username can only contain letters, numbers, and underscores";
		}

		if (!tag?.trim()) {
			newErrors.tag = "Tag is required";
		} else if (tag.length > 8) {
			newErrors.tag = "Tag cannot exceed 8 characters";
		} else if (!/^[a-zA-Z0-9]+$/.test(tag)) {
			newErrors.tag = "Tag can only contain letters and numbers";
		}

		if (!password) {
			newErrors.password = "Password is required to make changes";
		}

		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;

		setIsSubmitting(true);

		try {
			const body: any = {
				username,
				tag,
				bio,
				password,
			};

			const res = await fetch(`${import.meta.env.VITE_API_URL}/users/@me`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(body),
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to update profile");
			}

			const updatedUser = await res.json();
			session.updateCurrentUser(updatedUser);
			updateUserInAllGuilds(updatedUser, members, session.currentUser!.id);
			setOpenEditModal(false);
		} catch (error) {
			console.error("Error updating profile:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!session.currentUser) return null;

	return (
		<>
			<div className="bg-[#F2F2F2] dark:bg-[#302F2B] dim:bg-[#0f0f0f] rounded-[10px] px-6 py-4">
				<div className="flex flex-row gap-2 justify-between items-center">
					<div className="flex flex-col justify-center">
						<p className="font-bold">Username</p>
						<p className="translate-y-[-2px]">
							{session.currentUser.username}
							<span className="text-[20px] font-bold mx-1">/</span>
							{session.currentUser.tag}
						</p>
					</div>
					<Button
						className="!h-fit flex-none"
						onClick={() => setOpenEditModal(true)}
						filled
					>
						Edit Profile
					</Button>
				</div>
				{session.currentUser.bio && (
					<>
						<hr className="mt-3 border-[#D3D2C8] dark:border-[#464540] dim:border-[#302F2A]" />
						<div className="flex flex-row gap-2 justify-between items-center mt-2">
							<div className="flex flex-col justify-center">
								<p className="font-bold">Bio</p>
								<div className="translate-y-[-2px]">
									<MarkdownRenderer disabledFeatures={["codeblock"]}>
										{session.currentUser.bio}
									</MarkdownRenderer>
								</div>
							</div>
						</div>
					</>
				)}
			</div>

			<Modal
				show={openEditModal}
				close={() => setOpenEditModal(false)}
				title="Edit Profile"
				onConfirm={handleSubmit}
				confirmText="Save Changes"
				confirmDisabled={
					isSubmitting ||
					!username?.trim() ||
					!tag?.trim() ||
					!password.trim() ||
					(`${username.trim()}/${tag.trim()}` ===
						`${session.currentUser.username}/${session.currentUser.tag}` &&
						bio === (session.currentUser.bio || ""))
				}
			>
				<div className="flex flex-col gap-4 mt-4">
					<div className="flex flex-row gap-2">
						<div className="flex-1">
							<Input
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								id={`username-${nanoid()}`}
								label="Username"
							/>
						</div>
						<div className="w-32">
							<div className="relative">
								<Input
									value={tag}
									onChange={(e) => setTag(e.target.value)}
									id={`tag-${nanoid()}`}
									label="Tag"
								/>
							</div>
						</div>
					</div>
					<div className="!mb-1 flex flex-col w-full gap-2">
						<Input
							type="text"
							placeholder="Enter your bio"
							textarea
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							id={`bio-${nanoid()}`}
							label="Bio"
							maxLength={256}
						/>
						<p className="self-end">{bio.length} / 256</p>
					</div>
					<div className="!mb-3">
						<Input
							type="password"
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							id={`password-${nanoid()}`}
							label="Password"
						/>
					</div>
				</div>
			</Modal>
		</>
	);
}
