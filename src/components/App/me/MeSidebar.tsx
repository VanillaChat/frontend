import Input from "@/components/UI/Input";
import ChannelLink from "@/components/UI/ChannelLink";
import React from "react";
import {useTranslation} from "react-i18next";

export default function MeSidebar() {
    const { t } = useTranslation();
    return <div className="w-[300px] bg-[#f2f2f2] p-[20px_10px] dark:bg-[#2C2B27] dim:bg-[#101010]">
        <div className="relative w-full max-w-sm">
            <Input
                id="searchInput"
                className="pl-[38px] text-[15px] w-[100%] h-[36px] rounded-[8px] border-[1px] bg-white"
                placeholder={t("app.me.dmSearch")}
                // style={{
                //     backgroundColor: "#fff"
                // }}
                // style={{
                //     width: "100%",
                //     height: "36px",
                //     borderRadius: "8px",
                //     boxSizing: "border-box",
                //     backgroundColor: "#fff",
                //     borderWidth: "1px",
                // }}
            />
            <svg className="absolute left-[13px] top-1/2 transform -translate-y-1/2 text-black dark:text-white dim:text-white pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.75 15.75L11.2501 11.25M12.75 7.5C12.75 10.3995 10.3995 12.75 7.5 12.75C4.6005 12.75 2.25 10.3995 2.25 7.5C2.25 4.6005 4.6005 2.25 7.5 2.25C10.3995 2.25 12.75 4.6005 12.75 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <ChannelLink
            to="/channels/@me"
            style={{ marginTop: "10px" }}
            name={t("app.me.friends")}
            customIcon={
                <svg className="mr-[10px]" width="18" height="18" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1.73388C8.74086 2.10206 9.25 2.86657 9.25 3.75C9.25 4.63343 8.74086 5.39794 8 5.76612M9 8.38319C9.75573 8.72517 10.4363 9.28249 11 10M1 10C1.97325 8.76129 3.29459 8 4.75 8C6.20541 8 7.52675 8.76129 8.5 10M7 3.75C7 4.99264 5.99264 6 4.75 6C3.50736 6 2.5 4.99264 2.5 3.75C2.5 2.50736 3.50736 1.5 4.75 1.5C5.99264 1.5 7 2.50736 7 3.75Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            }
        />
        <p className="font-semibold text-[14px] ml-[3px] my-[8px]">{t("app.me.directMessages")}</p>
        <div className="flex flex-col gap-[2px]">
            <ChannelLink
                name="John Doe"
                closeable
                to="/channels/@me/32423423423423423423"
                isAvatar
                icon="https://cdn.discordapp.com/avatars/309427040908476416/f04949f40541d7036f687933d482a8dc.webp?size=1024"
            />
            <ChannelLink
                name="John Doe"
                customStatus="Hello World!"
                closeable
                to="/channels/@me/324242342342343534534"
                isAvatar
                icon="https://cdn.discordapp.com/avatars/309427040908476416/f04949f40541d7036f687933d482a8dc.webp?size=1024"
            />
        </div>
    </div>
}