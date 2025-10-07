"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/client";

type UserInfo = { user: { id: string; email: string; kdfSaltB64: string } | null };

export default function HeaderClient() {
	const [hasUser, setHasUser] = useState(false);

	useEffect(() => {
		getJson<UserInfo>("/api/auth/me").then((u) => setHasUser(!!u.user)).catch(() => setHasUser(false));
	}, []);

	async function logout() {
		try {
			await fetch("/api/auth/logout", { method: "POST" });
			location.reload();
		} catch {}
	}

	return (
		<div className="flex items-center gap-2">
			{hasUser && (
				<button onClick={logout} className="text-sm underline">Logout</button>
			)}
		</div>
	);
}
