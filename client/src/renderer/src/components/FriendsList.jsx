import Card from "./card/Card";

export default function FriendsList(){

	return (
		<div id="users">
			<Card component={
				<nav>Friends</nav>
			} />
		</div>
	);
}