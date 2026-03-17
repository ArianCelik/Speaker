import { Link } from "react-router-dom";
import { useAuth } from "../context/authentication/AuthProvider";
import headset from "../../../../../resources/headset.png";


export default function Header(){
	const { user } = useAuth();
	return (
		<div className="header-container">
			<div id="home-button">
				<Link to="/"><img src={headset} alt="headset" width="20" height="20" /></Link>
			</div>
			<div id="user-search">
				<form>
					<input type="search" placeholder="Search User" />
				</form>
			</div>
			<div id="logout">
				<button onClick={() => {}}>Logout</button>
			</div>
		</div>
	);
}