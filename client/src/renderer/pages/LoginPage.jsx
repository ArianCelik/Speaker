import Card from "../src/components/card/Card";
import  { Link } from "react-router-dom"
import { useState } from "react";
import { useAuth } from "../src/components/context/authentication/AuthProvider";

export default function LoginPage(){
	const { login } = useAuth();
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");

	async function handleLogin(e){
		e.preventDefault();
		if(email === "" || password === ""){
			return;
		}
		await login(email, password);
		setPassword("");
		setEmail("");
	}

	return (
		<div id="loginPage">
			<Card component={
				<>
					<h1 className="mb-3 text-center">Sign In</h1>
					<div className="line"></div>	
					<form onSubmit={handleLogin}>
						<div className="mb-3">
							<input 
								type="email" 
								onChange={e => setEmail(e.target.value)}
								className="form-control" 
								placeholder="Email" 
								id="email"/>
						</div>
						<div className="mb-3">
							<input 
								type="password" 
								onChange={e => setPassword(e.target.value)}
								className="form-control" 
								placeholder="Password" 
								id="password"/>
						</div>
						<button type="submit" className="btn btn-primary w-100">Login</button>
					</form>
					<div className="mt-3" id="signUp">
						<p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
					</div>
				</>
			}/>
		</div>
	)
}