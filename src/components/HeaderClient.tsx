"use client";

import ThemeToggle from "@/components/ThemeToggle";

export default function HeaderClient() {
	async function logout() {
		try {
			await fetch("/api/auth/logout", { method: "POST" });
			location.reload();
		} catch {}
	}
	return (
		<div className="flex items-center gap-2">
			<button onClick={logout} className="text-sm underline hidden sm:inline">Logout</button>
			<ThemeToggle />
		</div>
	);
}
