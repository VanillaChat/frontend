import {Navbar} from "@/components/UI/Navbar";
import {Outlet} from "react-router-dom";

export default function HomeLayout() {
    return <>
        <Navbar />
        <Outlet />
    </>
}