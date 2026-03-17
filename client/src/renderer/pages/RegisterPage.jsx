import Card from "../src/components/card/Card";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../src/components/context/authentication/AuthProvider";

export default function RegisterPage(){
	const { register } = useAuth();
	const [firstname, setFirstname] = useState("");
	const [lastname, setLastname] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [match, setMatch] = useState(true);

	function signup(e){
		e.preventDefault();

		if(firstname === "" || lastname === "" || username === "" || email === "" || password === "" || confirmPassword === ""){
			return;
		}
		if(password !== confirmPassword){
			setMatch(false);
			return;
		}
		register(firstname, lastname, username, email, password);
		setFirstname("");
		setLastname("");
		setUsername("");
		setEmail("");
		setPassword("");
		setConfirmPassword("");
	}

	return (
		<div id="registerPage">
			<Card component={
				<>
					<h1 className="mb-3 text-center">Sign Up</h1>
					<hr/>
					<form onSubmit={signup}>
						{match ? null : <div className="mb-3 alert alert-danger">Passwords do not match</div>}
						<div className="text-input mb-3">
							<input 
								type="text" 
								className="form-control" 
								placeholder="First name" 
								id="firstname"
								onChange={e => setFirstname(e.target.value)}/>
						</div>
						<div className="text-input mb-4">
							<input 
								type="text" 
								className="form-control" 
								placeholder="Last name" 
								id="lastname"
								onChange={e => setLastname(e.target.value)}/>
						</div>
						<div className="text-input mb-4">
							<input 
								type="text" 
								className="form-control" 
								placeholder="Username" 
								id="username"
								onChange={e => setUsername(e.target.value)}/>
						</div>
						<div className="text-input mb-4">
							<input 
								type="email" 
								className="form-control" 
								placeholder="Email" 
								id="email"
								onChange={e => setEmail(e.target.value)}/>
						</div>
						<div className="text-input mb-3">
							<input 
								type="password" 
								className="form-control" 
								placeholder="Password" 
								id="password"
								onChange={e => setPassword(e.target.value)}/>
						</div>
						<div className="text-input mb-3">
							<input 
								type="password" 
								className="form-control" 
								placeholder="Confirm Password" 
								id="confirmPassword"
								onChange={e => setConfirmPassword(e.target.value)}/>
						</div>
						<hr/>
						<button type="submit" className="btn btn-primary w-100">Register</button>
					</form>
					<div className="mt-3 text-center" id="signIn">
						<p>Already have an account? <Link to="/login">Sign In</Link></p>
					</div>
				</>
			}/>
		</div>
	)
}