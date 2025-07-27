import * as React from "react";
import logo from "@/icons/squarelogo.png";
import {NavLink, useNavigate} from "react-router-dom";
import Button from "@/components/UI/Button";
import {useSession} from "@/store/session";
import { Popover } from "@base-ui-components/react/popover";
import cn from "@/utils/cn";
import Avatar from "@/components/UI/Avatar";

export function ArrowSvg(props: React.ComponentProps<'svg'>) {
  return (
      <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
        <path
            d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
            className="fill-[canvas] dim:fill-black dark:fill-[#262622]"
        />
        <path
            d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
            className="fill-gray-200 dark:fill-none dim:fill-none"
        />
        <path
            d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
            className="dark:fill-[#333333] dim:fill-[#2E2E2E]"
        />
      </svg>
  );
}

export const Navbar = () => {
  const session = useSession();
  const navigate = useNavigate();

  return <>
    {/*<header className="navbar">*/}
    {/*  <NavLink to="/">*/}
    {/*    <div className="logo">*/}
    {/*      <img*/}
    {/*          src={logo}*/}
    {/*          width="32px"*/}
    {/*          height="32px"*/}
    {/*          alt="logo"*/}
    {/*          style={{ borderRadius: "8px" }}*/}
    {/*      />*/}
    {/*      <p className="wordmark">{import.meta.env.VITE_APP_NAME}</p>*/}
    {/*    </div>*/}
    {/*  </NavLink>*/}
    {/*  <nav className="links">*/}
    {/*    <NavLink to="/login" className="loginLink">*/}
    {/*      Log in*/}
    {/*    </NavLink>*/}
    {/*    <Button filled to="/register">*/}
    {/*      Sign up*/}
    {/*    </Button>*/}
    {/*  </nav>*/}
    {/*</header>*/}
    <header className="flex border-b-solid border-b-[1px] border-b-[#efe9e9] dark:bg-[#262622] dim:bg-black dim:border-b-[#2E2E2E] dark:border-b-[#2E2E2E] justify-between items-center md:px-[50px] py-[15px] px-[10px] transition-all duration-500 bg-[#fafafa] z-[1000] w-full">
      <NavLink to="/">
        <div className="flex items-center justify-center text-black dark:text-white dim:text-white rounded-[50%] mr-[20px]">
          <img alt="logo" src={logo} className="w-[32px] h-[32px]  rounded-[8px]" />
          <p className="ml-[8px] font-semibold text-[20px]">{import.meta.env.VITE_APP_NAME}</p>
        </div>
      </NavLink>
      <nav className="flex flex-row items-center">
        {session.currentUser ? (
            // <Button filled to="/channels/@me">
            //   Open Vanilla
            // </Button>
                <Popover.Root>
                  <Popover.Trigger className="flex size-10 items-center justify-center rounded-md cursor-pointer">
                      <Avatar width="42px" height="42px" id={session.currentUser.id} />
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Positioner sideOffset={8}>
                      <Popover.Popup
                          className={cn(
                              "origin-[var(--transform-origin)] rounded-lg bg-[canvas] px-6 py-4 text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0",
                              "dim:bg-black dark:bg-[#262622] dark:text-white dim:text-white dark:shadow-none dark:-outline-offset-1 dark:outline-[#333333] dim:shadow-none dim:-outline-offset-1 dim:outline-[#2A2A2A]"
                          )}
                      >
                        <Popover.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                          <ArrowSvg />
                        </Popover.Arrow>
                        <Popover.Title className="text-base font-medium">
                          Logged in as
                        </Popover.Title>
                        <Popover.Description className="text-base text-gray-600 dim:text-gray-200 dark:text-gray-200 flex flex-col gap-2">
                          <div className="flex">
                            <p className="font-bold">@{session.currentUser.username}</p>/{session.currentUser.tag}
                          </div>
                          <Button filled onClick={async () => {
                            navigate("/channels/@me");
                          }}>Open Vanilla</Button>
                          <Button onClick={async () => {
                            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                              method: 'POST',
                              credentials: 'include'
                            });
                            if (res.status === 204) session.logout();
                          }}>Logout</Button>
                        </Popover.Description>
                      </Popover.Popup>
                    </Popover.Positioner>
                  </Popover.Portal>
                </Popover.Root>
        ) : (
            <>
              <NavLink to="/login" className="no-underline text-[#667085] dark:text-[#c9c9c9] dim:text-[#c9c9c9] mr-[20px] transition duration-200 hover:text-[#303742] dark:hover:text-white dim:hover:text-white">
                Log in
              </NavLink>
              <Button filled to="/register">
                Sign up
              </Button>
            </>
        )}
      </nav>
    </header>
  </>
};
