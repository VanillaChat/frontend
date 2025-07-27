import {useState} from "react";
import FullScreen from "@/components/UI/FullScreen";
import {Tab} from "./Tab";
import {FaCog} from "react-icons/fa";
import {serverLinkStyle} from "@/utils/serverLinkStyle";

export const AccountSettingsPane = (props: {currentTab?: 'overview' | 'appearance'}) => {
    const [currentTab, setCurrentTab] = useState<typeof props.currentTab>(props.currentTab || 'overview');

    return <FullScreen ButtonElement={(props) =>
        <div className={serverLinkStyle({ isActive: false })} onClick={props.onClick}>
            <FaCog size="24px" />
        </div>
    }>
        <div className="h-[100%] w-[340px] py-10 px-3 flex flex-col gap-2 bg-[#F2F2F2] dark:bg-[#302F2B] dim:bg-[#000000]">
            <p className="font-bold">User Settings</p>
            <Tab active={currentTab === 'overview'} onClick={() => setCurrentTab('overview')}>Overview</Tab>
            <Tab active={currentTab === 'appearance'} onClick={() => setCurrentTab('appearance')}>Appearance</Tab>
        </div>
        <div className="w-full mx-6 my-10 flex flex-col gap-5 overflow-auto" style={{ scrollbarGutter: "stable both-edges" }}>
            <h1 className="font-bold text-[22px]">{currentTab!.split('-').map(str => str[0].toUpperCase() + str.slice(1).toLowerCase()).join(' ')}</h1>
            {
                currentTab === 'overview' &&
                <></>
            }
            {
                currentTab === 'appearance' &&
                <>
                </>
            }
        </div>
    </FullScreen>
}