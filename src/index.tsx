import React from "react";
import ReactDOM from "react-dom/client";
import Index from "./pages/Index";
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AppGuildLayout from "./components/layouts/AppGuildLayout";
import {enableMapSet} from "immer";
import "@/i18n";
import HomeLayout from "@/components/layouts/HomeLayout";
import ErrorBoundary from "@/components/layouts/ErrorBoundary";
import ChatPane, {ChatPaneStub} from "@/components/App/ChatPane";
import MemberList from "@/components/App/servers/MemberList";
import AppDMLayout from "@/components/layouts/AppDMLayout";
import AppLayout from "@/components/layouts/AppLayout";
import ThemeProvider from "@/context/ThemeProvider";
import {useMessages} from "@/store/messages";

enableMapSet();

const root = ReactDOM.createRoot(
  document.getElementById("app-root") as HTMLElement
);

export let router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
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
            loader: async () => {
              return {
                messages: []
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

root.render(
    <React.StrictMode>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </React.StrictMode>
);