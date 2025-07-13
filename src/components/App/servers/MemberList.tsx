import React from "react";
import "../../../styles/App/MemberList.css";

const MemberList: React.FC = () => {
  return (
    <div className="bg-[#f2f2f2] w-[500px] p-[5px_15px] dark:bg-[#2C2B27] dim:bg-[#070707]">
      <p className="font-medium">2 people</p>
      <div className="flex flex-row items-center gap-[10px] font-medium">
        <img
          width="35px"
          height="35px"
          src="https://cdn.discordapp.com/avatars/309427040908476416/f04949f40541d7036f687933d482a8dc.webp?size=1024"
          alt="channel icon"
          className="rounded-[50%]"
        />
        <p>ciach0_</p>
      </div>
    </div>
  );
};
export default MemberList;
