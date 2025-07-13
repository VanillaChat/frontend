import * as React from "react";
import "@/styles/UI/Navbar.css";
import logo from "@/icons/squarelogo.png";
import {NavLink} from "react-router-dom";
import Button from "@/components/UI/Button";
import CookieMaster from "@/utils/CookieMaster";

export const Navbar = () => {
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
        {CookieMaster.get(import.meta.env.PROD ? '__Host-Token' : 'token') ? (
            <Button filled to="/channels/@me">
              Open Vanilla
            </Button>
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
