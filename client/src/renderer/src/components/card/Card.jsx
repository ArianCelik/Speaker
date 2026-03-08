export default function Card({component}){
	return (
		<div className="card m-1 p-1">
            <div className="card-body m-1 p-1">
				{component}
            </div>
        </div>
	);
}