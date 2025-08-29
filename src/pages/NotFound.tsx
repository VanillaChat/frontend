import { nanoid } from "nanoid";
import type React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/UI/Button";
import ArrowLeft from "../icons/arrow-left.svg";
import XIcon from "../icons/x-icon.svg";

const NotFound: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	return (
		<main id={`not-found-${nanoid()}`}>
			<div
				className="flex flex-col items-center justify-center gap-3"
				style={{ height: location.pathname.includes("app") ? "100vh" : "80vh" }}
			>
				<img src={XIcon} alt="x-icon" />
				<h3 className="text-[30px] font-semibold mb-0">404 - Not Found</h3>
				<p className="mb-[32px] text-[#667085] w-[360px] text-center text-[16px]">
					We really don’t know, why you’re here... It’s a weird place, perhaps
					you’re lost?
				</p>
				<div className="flex flex-row items-center justify-center">
					<Button icon={ArrowLeft} onClick={() => navigate(-1)}>
						Go back
					</Button>
					<Button
						filled
						style={{ marginLeft: "12px" }}
						onClick={() => navigate("/")}
					>
						Take me home
					</Button>
				</div>
			</div>
		</main>
	);
};
export default NotFound;
