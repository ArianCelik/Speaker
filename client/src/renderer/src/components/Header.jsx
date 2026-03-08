import Card from "./card/Card";

export default function Header(){

	return (
		<div id="header">
			<Card component={
				<header>Header</header>
			}/>
		</div>
	);
}