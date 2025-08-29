import { nanoid } from "nanoid";
import {
	createBrowserRouter,
	type LoaderFunctionArgs,
	Navigate,
} from "react-router-dom";
import ChatPane, { ChatPaneStub } from "@/components/App/panes/ChatPane";
import MemberList from "@/components/App/servers/MemberList";
import AppDMLayout from "@/components/layouts/AppDMLayout";
import AppGuildLayout from "@/components/layouts/AppGuildLayout";
import AppLayout from "@/components/layouts/AppLayout";
import ErrorBoundary from "@/components/layouts/ErrorBoundary";
import HomeLayout from "@/components/layouts/HomeLayout";
import ForgotPassword from "@/pages/ForgotPassword";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Register from "@/pages/Register";
import { useMessages } from "@/store/messages";
import { useSession } from "@/store/session";

const appID = nanoid();

const messageLoader = async ({ params }: LoaderFunctionArgs) => {
	const messages = useMessages.getState();
	if (typeof messages.data[params.channelId as string] !== "undefined")
		return messages.data[params.channelId as string];
	const res = await fetch(
		`${import.meta.env.VITE_API_URL}/channels/${params.channelId as string}/messages`,
		{
			credentials: "include",
		},
	);
	return {
		messages: res.status === 200 ? await res.json() : [],
	};
};

export const router = createBrowserRouter([
	{
		path: "/",
		element: <HomeLayout />,
		hydrateFallbackElement: <></>,
		loader: async () => {
			const session = useSession.getState();
			if (session.currentUser) return;
			try {
				const res = await fetch(
					`${import.meta.env.VITE_API_URL}/auth/session`,
					{
						credentials: "include",
					},
				);
				if (res.status === 200) {
					const json = await res.json();
					session.login({
						currentUser: json.user,
						currentAccount: json.account,
						settings: json.settings,
					});
				}
			} catch (e) {
				console.error(e);
			}
		},
		children: [
			{
				index: true,
				element: <Index />,
			},
			{
				path: "login",
				element: <Login />,
			},
			{
				path: "register",
				element: <Register />,
			},
			{
				path: "forgot-password",
				element: <ForgotPassword />,
			},
		],
	},
	{
		path: "/channels",
		element: <AppLayout />,
		hydrateFallbackElement: <></>,
		children: [
			{
				index: true,
				element: <Navigate to="/channels/@me" replace />,
			},
			{
				path: "@me",
				element: <AppDMLayout id={appID} />,
				children: [
					{
						index: true,
						element: <div className="dark:bg-black"></div>,
					},
					{
						path: ":channelId",
						loader: messageLoader,
						element: (
							<>
								<ChatPane />
								<MemberList />
							</>
						),
					},
				],
			},
			{
				path: ":guildId",
				element: <AppGuildLayout id={appID} />,
				children: [
					{
						index: true,
						loader: () => ({
							messages: [],
						}),
						element: (
							<>
								<ChatPaneStub />
								<MemberList />
							</>
						),
					},
					{
						path: ":channelId",
						loader: messageLoader,
						hydrateFallbackElement: (
							<>
								<ChatPaneStub />
								<MemberList />
							</>
						),
						element: (
							<>
								<ChatPane />
								<MemberList />
							</>
						),
					},
				],
			},
		],
		errorElement: <ErrorBoundary />,
	},
	{
		path: "*",
		element: <HomeLayout />,
		children: [
			{
				path: "*",
				element: <NotFound />,
			},
		],
	},
]);
