import React, {ReactNode, useCallback, useEffect, useMemo, useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import Modal from "../UI/Modal";
import {FormInput} from "../UI/Input";
import {useTranslation} from "react-i18next";
import {useChannels, useServers} from "@/store/servers";
import cn from "@/utils/cn";
import {SubmitHandler, useForm} from "react-hook-form";
import z from "zod/v4";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "@/store/session";
import Alert from "@/components/UI/Alert";
import Tabs from "@/components/UI/Tabs";
import {MdAdminPanelSettings} from "react-icons/md";
import FullScreen from "@/components/UI/FullScreen";
import {useAppStore} from "@/store/app";
import {RiQuestionFill} from "react-icons/ri";
import Button, {buttonStyles} from "@/components/UI/Button";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/UI/Table";
import {formatDate} from "@/components/UI/Message";
import {FaCopy, FaTrash} from "react-icons/fa";

const ServerCreateSchema = z.object({
    name: z.string().min(2, "app.modals.serverCreate.nameMinChars").max(64, "app.modals.serverCreate.nameMaxChars"),
    brief: z.string().min(2, "app.modals.serverCreate.briefMinChars").max(24, "app.modals.serverCreate.briefMinChars"),
});

const ServerJoinSchema = z.object({
    invite: z.string().nonempty("app.modals.serverJoin.inviteRequired"),
});

export const serverLinkStyle = ({isActive, className}: {isActive: boolean, className?: string}) => cn(
    "bg-white border-[1px] border-[#dcdcdc] flex flex-col items-center justify-center w-[48px] h-[48px] no-underline text-[#303742] rounded-[14px] ease-in-out transition-all duration-[.2s] mb-[10px] cursor-pointer hover:bg-[#f7e26b] hover:border-[1px] hover:border-[#f7e26b] dark:border-[#877F4B] dark:bg-[#39372B] dark:text-[#F7E26B] dark:hover:bg-[#39372B] dim:bg-[#1D1D1D] dim:border-[#9b8f4d] dim:text-[#9b8f4d] dim:hover:bg-[#1D1D1D]",
    {
        "bg-[#f7e26b] border-[1px] border-[#f7e26b] dark:bg-[#F7E26B] dark:hover:bg-[#F7E26B] dark:text-black dim:text-black dim:bg-[#f7e26b] dim:hover:bg-[#f7e26b]": isActive
    },
    className
);

type TabProps = {
    children: ReactNode;
    active: boolean;
    onClick: () => void;
}

const Tab = (props: TabProps) => {
    return <div
        onClick={props.onClick}
        className={cn(
            "no-underline text-black cursor-pointer dark:text-white dim:text-white justify-between bg-transparent border-[1px] border-transparent p-[6px_13px] flex rounded-[8px] text-[16px] ease-in-out items-center group",
            {
                "hover:bg-white hover:border-[1px] hover:border-[#e0e0e0] dark:hover:bg-[#4D4A3D] dark:hover:border-[#4D4A3D] dim:hover:bg-[#171717] dim:hover:border-[#1C1C1C]": !props.active,
                "bg-white border-[1px] border-[#e0e0e0] dark:bg-[#4D4A3D] dark:border-[#4D4A3D] dim:bg-[#171717] dim:border-[#1C1C1C] active": props.active
            }
        )}
    >
        {props.children}
    </div>
}

const AdminPane = (props: {currentTab?: 'overview' | 'users' | 'instance-settings' | 'invite-codes'}) => {
    const [currentTab, setCurrentTab] = useState<typeof props.currentTab>(props.currentTab || 'overview');
    const appStore = useAppStore();
    const [error, setError] = useState<boolean>(false);
    const session = useSession();

    const columnHelper = createColumnHelper<typeof appStore.settings.inviteCodes[number]>();

    const unusedInviteColumns = useMemo(() => [
        columnHelper.accessor('code', {
            header: 'Code',
            filterFn: 'includesString',
            cell: ({cell}) => <div className="flex flex-row gap-2 items-center">
                <span className="!select-text">{cell.getValue()}</span>
                <div className={cn(buttonStyles({filled: false}), 'p-2')} onClick={() => navigator.clipboard.writeText(cell.getValue())}>
                    <FaCopy />
                </div>
            </div>
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created At',
            filterFn: 'includesString',
            cell: ({cell}) => formatDate(cell.getValue())
        }),
        columnHelper.accessor('createdBy', {
            header: 'Created By',
            filterFn: 'includesString',
            cell: ({cell}) => <div className="flex flex-row gap-2 text-center items-center">
                <img src="https://cdn.discordapp.com/avatars/309427040908476416/f04949f40541d7036f687933d482a8dc.webp?size=1024" width="32px" height="32px" className="rounded-[100%]" alt="avatar" />
                <p>{cell.getValue().username}</p>
            </div>
        }),
        // columnHelper.accessor('id', {
        //     header: 'ID',
        //     filterFn: 'includesString',
        // }),
        columnHelper.display({
            cell: cell =>
                <div
                    className={cn(buttonStyles({filled: false}), 'p-2 w-fit justify-self-end')}
                    onClick={async () => {
                        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/invite-codes/${cell.row.original.id}`, {
                            method: 'DELETE',
                            credentials: 'include'
                        });

                        if (res.status === 204) {
                            appStore.setSettings({
                               inviteCodes: appStore.settings.inviteCodes.filter(code => code.id !== cell.row.original.id)
                            });
                        } else {
                            setError(true);
                        }
                    }}
                >
                    <FaTrash color="#FF4D4D" />
                </div>,
            id: 'actions'
        })
    ], []);

    const usedInviteColumns = useMemo(() => [
        columnHelper.accessor('code', {
            header: 'Code',
            filterFn: 'includesString',
            cell: ({cell}) => <div className="flex flex-row gap-2 items-center">
                <span className="!select-text">{cell.getValue()}</span>
                <div className={cn(buttonStyles({filled: false}), 'p-2')} onClick={() => navigator.clipboard.writeText(cell.getValue())}>
                    <FaCopy />
                </div>
            </div>
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created At',
            filterFn: 'includesString',
            cell: ({cell}) => formatDate(cell.getValue())
        }),
        columnHelper.accessor('createdBy', {
            header: 'Created By',
            filterFn: 'includesString',
            cell: ({cell}) => <div className="flex flex-row gap-2 text-center items-center">
                <img src="https://cdn.discordapp.com/avatars/309427040908476416/f04949f40541d7036f687933d482a8dc.webp?size=1024" width="32px" height="32px" className="rounded-[100%]" alt="avatar" />
                <p>{cell.getValue().username}</p>
            </div>
        }),
        columnHelper.accessor('usedBy', {
            header: 'Used By',
            filterFn: 'includesString',
            cell: ({cell}) => <div className="flex flex-row gap-2 text-center items-center">
                <img src="https://cdn.discordapp.com/avatars/309427040908476416/f04949f40541d7036f687933d482a8dc.webp?size=1024" width="32px" height="32px" className="rounded-[100%]" alt="avatar" />
                <p>{(cell.getValue() as any).user.username}</p>
            </div>
        })
    ], []);

    const onCreateCode = useCallback(async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/invite-codes`, {
            method: 'POST',
            credentials: 'include'
        });
        if (res.status === 200) {
            appStore.setSettings({
                inviteCodes: [
                    ...appStore.settings.inviteCodes,
                    {
                        ...await res.json(),
                        createdBy: session.currentUser
                    }
                ]
            })
            setError(false);
        } else {
            setError(true);
        }
    }, []);

    return <FullScreen ButtonElement={(props) =>
        <div
            className={serverLinkStyle({
                isActive: false,
                className: 'justify-self-end mt-auto mb-5'
            })}
            onClick={props.onClick}
        >
            <MdAdminPanelSettings size="28px" />
        </div>
    }>
        <div className="h-[100%] w-[340px] py-10 px-3 flex flex-col gap-2 bg-[#F2F2F2] dark:bg-[#302F2B] dim:bg-[#000000]">
            <p className="font-bold">Admin Settings</p>
            <Tab active={currentTab === 'overview'} onClick={() => setCurrentTab('overview')}>Overview</Tab>
            <Tab active={currentTab === 'users'} onClick={() => setCurrentTab('users')}>Users</Tab>
            {
                import.meta.env.VITE_REGISTRATION_CLOSED &&
                <Tab active={currentTab === 'invite-codes'} onClick={() => setCurrentTab('invite-codes')}>Invite Codes</Tab>
            }
            <Tab active={currentTab === 'instance-settings'} onClick={() => setCurrentTab('instance-settings')}>Instance Configuration</Tab>
        </div>
        <div className="w-full mx-6 my-10 flex flex-col gap-5">
            <h1 className="font-bold text-[22px]">{currentTab!.split('-').map(str => str[0].toUpperCase() + str.slice(1).toLowerCase()).join(' ')}</h1>

            {
                currentTab === 'invite-codes' &&
                <>
                    <p className="translate-y-[-12px] max-w-[660px]">Registration is closed on this instance and new users require an invite code to register. To reopen it, a sysadmin needs to toggle its flag in the environment variables.</p>
                    <div className="flex z-50">
                        <Button filled onClick={onCreateCode}>Create code</Button>
                    </div>
                    {error && <Alert variant="destructive">An error occurred.</Alert>}
                    {
                        appStore.settings.inviteCodes.length === 0 &&
                        <div className="flex flex-col gap-3 h-full w-full justify-center items-center translate-y-[-48px]">
                            <RiQuestionFill size="42px" />
                            <h1 className="font-bold text-[24px]">No invite codes found</h1>
                            <p>There are no invite codes present. Create one and get the party started!</p>
                        </div>
                    }
                    {
                        appStore.settings.inviteCodes.filter(x => !x.used).length > 0 &&
                        <>
                            <p className="font-bold mt-2 translate-x-[0_5px]">Active codes</p>
                            <Table columns={unusedInviteColumns} data={appStore.settings.inviteCodes.filter(x => !x.used)} />
                        </>
                    }
                    {
                        appStore.settings.inviteCodes.filter(x => x.used).length > 0 &&
                        <>
                            <p className="font-bold mt-2 translate-x-[0_5px]">Archived codes</p>
                            <Table columns={usedInviteColumns} data={appStore.settings.inviteCodes.filter(x => x.used)} />
                        </>
                    }
                </>
            }
        </div>
    </FullScreen>
}

const ServerAddModal: React.FC = () => {
    const [showModal, setModal] = React.useState(false);
    const { t } = useTranslation();
    const user = useSession(session => session.currentUser);
    const servers = useServers();
    const navigate = useNavigate();
    const [globalError, setGlobalError] = React.useState<string | null>(null);
    const channels = useChannels();
    const [mode, setMode] = React.useState<'create' | 'join'>('create');
    const appStore = useAppStore();
    const {
        register: registerCreate,
        handleSubmit: handleSubmitCreate,
        formState: { errors: errorsCreate, isValid: isValidCreate, isSubmitting: isSubmittingCreate },
        setError: setErrorCreate,
        setValue: setValueCreate
    } = useForm<z.infer<typeof ServerCreateSchema>>({
        resolver: zodResolver(ServerCreateSchema)
    });

    const {
        register: registerJoin,
        handleSubmit: handleSubmitJoin,
        formState: { errors: errorsJoin, isValid: isValidJoin, isSubmitting: isSubmittingJoin },
        setError: setErrorJoin,
        setValue: setValueJoin
    } = useForm<z.infer<typeof ServerJoinSchema>>({
        resolver: zodResolver(ServerJoinSchema)
    });

    useEffect(() => {
        setValueCreate("name", t('app.modals.serverCreate.defaultName', { username: user?.username }));
        setValueCreate("brief", t('app.modals.serverCreate.defaultBrief'));
        setValueJoin("invite", "");
    }, []);

    const onSubmitCreate: SubmitHandler<z.infer<typeof ServerCreateSchema>> = React.useCallback(async (data) => {
        try {
            const createdGuild = await fetch(`${import.meta.env.VITE_API_URL}/guilds`, {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const json = await createdGuild.json();
            if (createdGuild.status === 200) {
                servers.insert(json.guild);
                channels.set(json.guild.id, json.channels);
                setModal(false);
                appStore.setHasModal(false);
                navigate(`/channels/${json.guild.id}/${json.channels[0].id}`);
            } else {
                if (json.path === 'global') setGlobalError(json.message);
                else setErrorCreate(json.path, json.message);
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const onSubmitJoin: SubmitHandler<z.infer<typeof ServerJoinSchema>> = React.useCallback(async (data) => {
        try {
            const guild = await fetch(`${import.meta.env.VITE_API_URL}/invites/${data.invite.replace(import.meta.env.VITE_INVITE_URL, '')}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const json = await guild.json();
            if (guild.status === 200) {
                servers.insert(json.guild);
                channels.set(json.guild.id, json.guild.channels);
                setModal(false);
                appStore.setHasModal(false);
                navigate(`/channels/${json.guild.id}/${json.guild.channels[0].id}`);
            } else {
                if (json.path === 'global') setGlobalError(json.message);
                else setErrorJoin(json.path, json.message);
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    return <>
        <div
            className={serverLinkStyle({ isActive: false })}
            onClick={() => {
                setModal(true);
                appStore.setHasModal(true);
            }}
        >
            <svg width="24" height="24" className="dark:text-[#F7E26B]" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5.63403V19.634M5 12.634H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <Modal
            show={showModal}
            close={() => {
                setModal(false);
                appStore.setHasModal(false);
            }}
            title={t(mode === 'create' ? "app.modals.serverCreate.title" : 'app.modals.serverJoin.title')}
            confirmText={
                mode === 'create' ? (
                    isSubmittingCreate ? t('common.creating') : t('common.create')
                ) : (
                    isSubmittingJoin ? t('common.joining') : t('common.join')
                )
            }
            confirmDisabled={mode === 'create' ? (!isValidCreate || isSubmittingCreate) : (!isValidJoin || isSubmittingJoin)}
            closable={mode === 'create' ? !isSubmittingCreate : !isSubmittingJoin}
            onConfirm={() => {
                if (mode === 'create') handleSubmitCreate(onSubmitCreate)();
                else handleSubmitJoin(onSubmitJoin)();
            }}
            subtitle={t("app.modals.serverCreate.subtitle")}
        >
            {globalError && <Alert variant="destructive" title="Server error">{t(globalError)}</Alert>}
            <Tabs
                activeTab={mode}
                setActiveTab={setMode}
                data={[
                    {
                        name: t('common.create'),
                        id: 'create',
                        contents: <form onSubmit={handleSubmitCreate(onSubmitCreate)}>
                            <FormInput
                                type="text"
                                placeholder={t('app.modals.serverCreate.name')}
                                label={t("app.modals.serverCreate.name")}
                                name="name"
                                id="name"
                                labelStyle={{ marginTop: "15px" }}
                                register={registerCreate}
                                translatedError={{error: errorsCreate.name!}}
                            />
                            <FormInput
                                type="text"
                                placeholder={t('app.modals.serverCreate.brief')}
                                label={t("app.modals.serverCreate.brief")}
                                name="brief"
                                id="brief"
                                labelStyle={{ marginTop: "15px" }}
                                register={registerCreate}
                                translatedError={{error: errorsCreate.brief!}}
                            />
                        </form>
                    },
                    {
                        name: t('common.join'),
                        id: 'join',
                        contents: <form onSubmit={handleSubmitJoin(onSubmitJoin)}>
                            <FormInput
                                type="text"
                                placeholder={t('app.modals.serverJoin.invite')}
                                label={t("app.modals.serverJoin.invite")}
                                name="invite"
                                id="invite"
                                labelStyle={{ marginTop: "15px" }}
                                register={registerJoin}
                                translatedError={{error: errorsJoin.invite!}}
                            />
                        </form>
                    }
                ]}
            />
        </Modal>
    </>
}

const ServerSidebar: React.FC = () => {
    const servers = useServers();
    const channels = useChannels();
    const session = useSession();
    return (
        <>
            <div className="flex overflow-hidden flex-col h-[100%] bg-[#e9e9e9] w-[72px] items-center pt-[15px] dark:bg-[#302F2B] dim:bg-black">
                <div>
                    <NavLink
                        to="/channels/@me"
                        className={({isActive}) => serverLinkStyle({ isActive, className: 'text-[32px] font-logo font-bold' })}
                    >
                        V
                    </NavLink>
                    <ServerAddModal />
                </div>
                {servers.data.length > 0 && <div className="w-[35px] h-[1px] bg-black dark:bg-[#9b8f4d] dim:bg-[#9b8f4d]" />}
                <div className="overflow-auto mt-[10px]" style={{scrollbarWidth: 'none'}}>
                    {servers.data.map((server) => (
                        <NavLink
                            to={`/channels/${server.id}/${channels.data[server.id]?.[0].id ?? ''}`}
                            className={({isActive}) => serverLinkStyle({ isActive, className: 'font-semibold' })}
                            key={server.id}
                        >
                            {server.name
                                .split(" ")
                                .map((word) => word[0])
                                .join("")}
                        </NavLink>
                    ))}
                </div>
                {((session.currentUser!.flags & 1 << 0) === 1 << 0) && <AdminPane />}
            </div>
        </>
    );
};
export default ServerSidebar;
