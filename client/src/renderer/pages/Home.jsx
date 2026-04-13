import Header from "../src/components/layout/Header";
import ChatList from "../src/components/layout/ChatList";

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
				<nav id="users"><ChatList/></nav>
				<main>
					{main}
				</main>
			</div>
		</>
	)
}