import { nanoid } from "nanoid";
import { Highlight, themes } from "prism-react-renderer";
import {
	isRouteErrorResponse,
	useNavigate,
	useRouteError,
} from "react-router-dom";
import Button from "@/components/UI/Button";
import Collapsible from "@/components/UI/Collapsible";
import ArrowLeft from "@/icons/arrow-left.svg";
import XIcon from "@/icons/x-icon.svg";

export default function ErrorBoundary() {
	const error = useRouteError();
	const navigate = useNavigate();
	let err: string;
	let stack: string | undefined;
	if (isRouteErrorResponse(error)) {
		err = `${error.statusText} ${error.status}`;
		stack = error.data;
	} else if (error instanceof Error) {
		err = `${error.name}: ${error.message}`;
		stack = error.stack?.toString();
	} else {
		err =
			"We really don’t know, why you’re here... It’s a weird place, perhaps you’re lost?";
		stack = undefined;
	}
	// if (isRouteErrorResponse(error)) {
	//     return <>
	//         <h1>{error.status} {error.statusText}</h1>
	//         <p>{error.data}</p>
	//     </>
	// } else if (error instanceof Error) {
	//     return <>
	//         <h1>Error</h1>
	//         <p>{error.message}</p>
	//         <p>The stack trace is:</p>
	//         <pre>{error.stack}</pre>
	//     </>
	// }
	// return <h1>Unknown Error</h1>;
	return (
		<main id={`error-boundary-${nanoid()}`}>
			<div
				className={`flex flex-col items-center justify-center`}
				style={{ height: location.pathname.includes("app") ? "100vh" : "80vh" }}
			>
				<img src={XIcon} alt="x-icon" />
				<h3 className="text-[30px] font-semibold mb-0 text-[#FF4D4D]">
					An {!stack && "unknown"} error occurred
				</h3>
				<p className="mb-[32px] text-[#667085] w-[360ox] text-center text-[16px]">
					{err}
				</p>
				{stack && (
					<Collapsible title="Expand error" expandedTitle="Collapse error">
						<Highlight
							language="javascript"
							code={stack}
							theme={themes.oneLight}
						>
							{({ style, tokens, getLineProps, getTokenProps }) => (
								<pre
									style={{ ...style, userSelect: "text", pointerEvents: "all" }}
								>
									{tokens.map((line) => (
										<div
											key={nanoid()}
											style={{ userSelect: "text", pointerEvents: "all" }}
											{...getLineProps({ line })}
										>
											{line.map((token) => (
												<span
													key={nanoid()}
													{...getTokenProps({ token })}
													style={{
														userSelect: "text",
														pointerEvents: "all",
														...getTokenProps({ token }).style,
													}}
												/>
											))}
										</div>
									))}
								</pre>
							)}
						</Highlight>
					</Collapsible>
				)}
				<div className="buttons" style={{ marginTop: "16px" }}>
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
}
