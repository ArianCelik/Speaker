import Header from "../src/components/layout/Header";
import FriendsList from "../src/components/layout/FriendsList";

export default function Home({main}){
	
	return (
		<>
			<div id="header">
				<div className="card p-0 m-1 mb-0">
					<div className="card-body p-1 m-0">
						<Header/>
					</div>
				</div>
			</div>
			<div className='layout'>
				<nav id="users"><FriendsList/></nav>
				<main>
					{main}
				</main>
			</div>
		</>
	)
}