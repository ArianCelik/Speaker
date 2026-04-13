import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
	baseURL: "https://localhost:3000",
	withCredentials: true,
});
const AuthContext = createContext(undefined);


export const useAuth = () => {
	const authContext = useContext(AuthContext);
	if(!authContext) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return authContext;
}

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const interceptor = api.interceptors.request.use((config) => {
			if(token){
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		});

		return () => {
			api.interceptors.request.eject(interceptor);
		}
	}, [token]);


	useEffect(() => {
		const interceptor = api.interceptors.response.use((res) => res, async (err) => {
			const original = err.config;
			if (err.response?.status === 401 && !original._retry && original.url !== "/auth/refresh") {
				original._retry = true;
				try {
					const res = await api.post("/auth/refresh");
					const newToken = res.data.accessToken;
					setToken(newToken);
					original.headers.Authorization = `Bearer ${newToken}`;
					return api(original);
				} catch (refreshErr) {
					setToken(null);
					setUser(null);
					return Promise.reject(refreshErr);
				}
			}
			return Promise.reject(err);
		});
		return () => api.interceptors.response.eject(interceptor);
	}, []);

	useEffect(() => {
		api.post("/auth/refresh").then(async (res) => {
			const newToken = res.data.accessToken;
			setToken(newToken);
			const meRes = await api.get("/auth/me", {
				headers: { Authorization: `Bearer ${newToken}` }
			});
			setUser(meRes.data.user);
		}).catch(() => {
			setToken(null);
			setUser(null);
		}).finally(() => setLoading(false));
	}, []);

	const login = async (email, password) => {
		const res = await api.post("/auth/login", { email, password });
		setToken(res.data.accessToken);
		setUser(res.data.user);
		return res.data.user;
	};

	const register = async (username, firstname, lastname, email, password) => {
		const res = await api.post("/auth/register", { username, firstname, lastname, email, password });
		setToken(res.data.accessToken);
		setUser(res.data.user);
		return res.data.user;
	};

	const logout = async () => {
		await api.post("/auth/logout");
		setToken(null);
		setUser(null);
	};

	if (loading) return null;

	return (
		<AuthContext.Provider value={{ user, token, login, register, logout }}>
		{children}
		</AuthContext.Provider>
	);
}