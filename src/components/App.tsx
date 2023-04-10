import Sidebar from "./Sidebar";
import ChatPane from "./ChatPane";
import "../styles/App.css";
import MemberList from "./MemberList";
import useMeta from "../hooks/useMeta";
import { useLocation } from "react-router-dom";

export default function App() {
  useMeta("#channel | Guild Name");
  const location = useLocation();
  return (
    <main id="app">
      <Sidebar />
      {!location.pathname.includes("@me") && (
        <>
          <ChatPane />
          <MemberList />
        </>
      )}
    </main>
  );
}
