import React, {useRef, useState} from "react";
import FullScreen from "@/components/UI/FullScreen";
import {Tab} from "./Tab";
import {FaCog, FaPencilAlt} from "react-icons/fa";
import {serverLinkStyle} from "@/utils/serverLinkStyle";
import {User} from "@/types/User";
import {useSession} from "@/store/session";
import Avatar from "@/components/UI/Avatar";
import Input from "@/components/UI/Input";
import Modal from "@/components/UI/Modal";
import Button from "@/components/UI/Button";
import {useMembers} from "@/store/servers";

const updateUserInAllGuilds = (updatedUser: User, members: ReturnType<typeof useMembers.getState>, currentUserId: string) => {
    Object.entries(members.data).forEach(([guildId, guildMembers]) => {
        const currentUserMember = guildMembers.find(m => m.user.id === currentUserId);
        if (currentUserMember) {
            members.updateMember(guildId, {
                ...currentUserMember,
                user: {
                    ...currentUserMember.user,
                    ...updatedUser
                }
            });
        }
    });
};

export const AccountSettingsPane = (props: {currentTab?: 'overview' | 'appearance'}) => {
    const [currentTab, setCurrentTab] = useState<typeof props.currentTab>(props.currentTab || 'overview');
    const session = useSession();
    const members = useMembers();

    const [showModal, setShowModal] = useState(false);
    const [username, setUsername] = useState('');
    const [tag, setTag] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const openEditModal = () => {
        setUsername(session.currentUser?.username || '');
        setTag(session.currentUser?.tag || '');
        setPassword('');
        setShowModal(true);
    };

    const validate = () => {
        const newErrors: {username?: string; tag?: string; password?: string} = {};

        if (!username.trim()) {
            newErrors.username = 'Username is required';
        } else if (username.length < 2) {
            newErrors.username = 'Username must be at least 2 characters';
        } else if (username.length > 32) {
            newErrors.username = 'Username cannot exceed 32 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        if (!tag.trim()) {
            newErrors.tag = 'Tag is required';
        } else if (tag.length > 8) {
            newErrors.tag = 'Tag cannot exceed 8 characters';
        } else if (!/^[a-zA-Z0-9]+$/.test(tag)) {
            newErrors.tag = 'Tag can only contain letters and numbers';
        }

        if (!password) {
            newErrors.password = 'Password is required to make changes';
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);

        try {
            let body: any = {
                username,
                tag,
                password
            };

            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/@me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update profile');
            }

            const updatedUser = await res.json();
            session.updateCurrentUser(updatedUser);
            updateUserInAllGuilds(updatedUser, members, session.currentUser!.id);
            setShowModal(false);

        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsSubmitting(true);
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/@me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    avatar: base64,
                    password: password || ''
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update avatar');
            }

            const updatedUser = await res.json();
            session.updateCurrentUser(updatedUser);
            updateUserInAllGuilds(updatedUser, members, session.currentUser!.id);
            setShowModal(false);
        } catch (error) {
            console.error('Error updating avatar:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsSubmitting(true);
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/@me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    banner: base64,
                    password: password || ''
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update banner');
            }

            const updatedUser = await res.json();
            session.updateCurrentUser(updatedUser);
            updateUserInAllGuilds(updatedUser, members, session.currentUser!.id);
            setShowModal(false);
        } catch (error) {
            console.error('Error updating banner:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!session.currentUser || !session.currentAccount) return null;

    return (
        <FullScreen ButtonElement={(props) =>
            <div className={serverLinkStyle({ isActive: false })} onClick={props.onClick}>
                <FaCog size="24px" />
            </div>
        }>
            <div className="h-[100%] w-[340px] py-10 px-3 flex flex-col gap-2 bg-[#F2F2F2] dark:bg-[#302F2B] dim:bg-[#000000]">
                <p className="font-bold">User Settings</p>
                <Tab active={currentTab === 'overview'} onClick={() => setCurrentTab('overview')}>Overview</Tab>
                <Tab active={currentTab === 'appearance'} onClick={() => setCurrentTab('appearance')}>Appearance</Tab>
            </div>
            <div className="w-full ml-6 mr-11 my-10 flex flex-col gap-5 overflow-auto" style={{ scrollbarGutter: "stable both-edges" }}>
                <h1 className="font-bold text-[22px]">
                    {currentTab!.split('-').map(str => str[0].toUpperCase() + str.slice(1).toLowerCase()).join(' ')}
                </h1>
                {currentTab === 'overview' && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-row gap-2 items-center mt-5">
                            <div className="relative group">
                                <div className="relative w-[94px] h-[94px] rounded-[10px] overflow-hidden">
                                    <Avatar
                                        id={session.currentUser.id}
                                        avatar={session.currentUser.avatar}
                                        width="100%"
                                        height="100%"
                                        className="w-full h-full object-cover rounded-[10px]"
                                    />
                                    <div
                                        className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            avatarInputRef.current?.click();
                                        }}
                                    >
                                        <FaPencilAlt className="text-white text-lg mb-0.5" />
                                        <span className="text-[14px] text-white">Change</span>
                                    </div>
                                    <input
                                        type="file"
                                        ref={avatarInputRef}
                                        className="hidden"
                                        accept="image/png,image/jpeg,image/webp,image/gif"
                                        id="avatarInput"
                                        name="avatar"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                            </div>
                            <div className="relative flex-1">
                                <div
                                    className="relative w-full h-[94px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-[10px] overflow-hidden cursor-pointer group"
                                    onClick={() => bannerInputRef.current?.click()}
                                >
                                    {session.currentUser.banner && (
                                        <img 
                                            src={`${import.meta.env.VITE_API_URL}/cdn/banners/${session.currentUser.id}/${session.currentUser.banner}.webp`}
                                            alt="Banner" 
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <div className="flex flex-col items-center text-white">
                                            <FaPencilAlt className="text-lg mb-1" />
                                            <span className="text-sm">Change Banner</span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={bannerInputRef}
                                        className="hidden"
                                        accept="image/png,image/jpeg,image/webp,image/gif"
                                        id="bannerInput"
                                        name="banner"
                                        onChange={handleBannerChange}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                        <div className="flex flex-col text-white my-[4px]">
                                            <span className="text-xl font-bold">
                                                {session.currentUser.username}
                                            </span>
                                            <span className="text-[14px] text-gray-300">
                                                / {session.currentUser.tag}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="font-bold">Username</p>
                            <div className="flex flex-row gap-2 justify-between items-center">
                                <p>
                                    {session.currentUser.username}
                                    <span className="text-[20px] font-bold mx-1">/</span>
                                    {session.currentUser.tag}
                                </p>
                                <Button className="!h-fit flex-none" onClick={openEditModal} filled>Edit Profile</Button>
                            </div>
                            {/* Add more account settings here */}
                        </div>
                    </div>
                )}
                {currentTab === 'appearance' && (
                    <div>
                        {/* Appearance settings will go here */}
                    </div>
                )}
            </div>

            <Modal
                show={showModal}
                close={() => setShowModal(false)}
                title="Edit Profile"
                onConfirm={handleSubmit}
                confirmText="Save Changes"
                confirmDisabled={isSubmitting || (!username.trim() || !tag.trim() || !password.trim()) || (`${username.trim()}/${tag.trim()}` === `${session.currentUser.username}/${session.currentUser.tag}`)}
            >
                <div className="flex flex-col gap-4 mt-4">
                    <div className="flex flex-row gap-2">
                        <div className="flex-1">
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                id="username"
                                label="Username"
                            />
                        </div>
                        <div className="w-32">
                            <div className="relative">
                                <Input
                                    value={tag}
                                    onChange={(e) => setTag(e.target.value)}
                                    id="tag"
                                    label="Tag"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="!mb-3">
                        <Input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="password"
                            label="Password"
                        />
                    </div>
                </div>
            </Modal>
        </FullScreen>
    );
};