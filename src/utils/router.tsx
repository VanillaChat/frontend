import {createBrowserRouter, Navigate} from "react-router-dom";
import HomeLayout from "@/components/layouts/HomeLayout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import AppLayout from "@/components/layouts/AppLayout";
import AppDMLayout from "@/components/layouts/AppDMLayout";
import ChatPane, {ChatPaneStub} from "@/components/App/ChatPane";
import MemberList from "@/components/App/servers/MemberList";
import AppGuildLayout from "@/components/layouts/AppGuildLayout";
import {useMessages} from "@/store/messages";
import ErrorBoundary from "@/components/layouts/ErrorBoundary";
import NotFound from "@/pages/NotFound";
import React from "react";
import {useSession} from "@/store/session";

export let router = createBrowserRouter([
    {
        path: '/',
        element: <HomeLayout />,
        hydrateFallbackElement: <></>,
        loader: async () => {
            const session = useSession.getState();
            if (session.currentUser) return;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/session`, {
               credentials: 'include'
            });
            if (res.status === 200) {
                const json = await res.json();
                session.login({
                    currentUser: json.user,
                    currentAccount: json.account
                });
            }
        },
        children: [
            {
                index: true,
                element: <Index />
            },
            {
                path: 'login',
                element: <Login />
            },
            {
                path: 'register',
                element: <Register />
            },
            {
                path: 'forgot-password',
                element: <ForgotPassword />
            },
        ]
    },
    {
        path: '/channels',
        element: <AppLayout />,
        hydrateFallbackElement: <></>,
        children: [
            {
                index: true,
                element: <Navigate to="/channels/@me" replace />
            },
            {
                path: '@me',
                element: <AppDMLayout />,
                children: [
                    {
                        index: true,
                        element: <div className="dark:bg-black"></div>
                    },
                    {
                        path: ':channelId',
                        loader: async ({ params }) => {
                            const messages = useMessages.getState();
                            if (typeof messages.data[params.channelId!] !== 'undefined') return messages.data[params.channelId!];
                            const res = await fetch(`${import.meta.env.VITE_API_URL}/channels/${params.channelId!}/messages`, {
                                credentials: 'include'
                            });
                            return {
                                messages: res.status === 200 ? await res.json() : []
                            }
                        },
                        element: <>
                            <ChatPane />
                            <MemberList />
                        </>
                    }
                ]
            },
            {
                path: ':guildId',
                element: <AppGuildLayout />,
                children: [
                    {
                        index: true,
                        loader: () => ({
                            messages: []
                        }),
                        element: <>
                            <ChatPaneStub />
                            <MemberList />
                        </>
                    },
                    {
                        path: ':channelId',
                        loader: async ({ params }) => {
                            const messages = useMessages.getState();
                            if (typeof messages.data[params.channelId!] !== 'undefined') return messages.data[params.channelId!];
                            const res = await fetch(`${import.meta.env.VITE_API_URL}/channels/${params.channelId!}/messages`, {
                                credentials: 'include'
                            });
                            return {
                                messages: res.status === 200 ? await res.json() : []
                            }
                        },
                        hydrateFallbackElement: <>
                            <ChatPaneStub />
                            <MemberList />
                        </>,
                        element: <>
                            <ChatPane />
                            <MemberList />
                        </>
                    }
                ]
            }
        ],
        errorElement: <ErrorBoundary />
    },
    {
        path: '*',
        element: <HomeLayout />,
        children: [
            {
                path: '*',
                element: <NotFound />
            }
        ]
    }
]);