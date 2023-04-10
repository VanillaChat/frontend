import React from "react";
import { NavLink } from "react-router-dom";
import Plus from "../icons/plus.svg";
import Modal from "./Modal";
import Input from "./Input";

const SpaceSidebar: React.FC = () => {
  const [showModal, setModal] = React.useState(false);
  const [spaceName, setSpaceName] = React.useState("Ciach's Space");
  return (
    <>
      <div className="guild-list">
        <NavLink to="/app/guilds/@me" className="guild-link">
          V
        </NavLink>
        <div className="guild-link" onClick={() => setModal(true)}>
          <img src={Plus} className="plus-icon" alt="icon" />
        </div>
      </div>
      <Modal
        show={showModal}
        close={() => setModal(false)}
        title="Create a Space"
        confirmText="Create"
        onConfirm={() => void 0}
        subtitle="A Space is a group of multiple users that can talk about different topics in rooms called Tunnels."
      >
        <Input
          id="roomName"
          placeholder={"Space Name"}
          value={spaceName}
          onChange={(e) => setSpaceName(e.target.value)}
          label={"Space Name"}
        />
      </Modal>
    </>
  );
};
export default SpaceSidebar;
