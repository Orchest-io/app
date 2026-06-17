import { useState, useRef, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { logoutUser } from "../../../api/users.api";
import { useMe, useUpdateMySettings } from "../../../hooks/useSettings";
import NotificationPanel from "../../ui/NotificationPanel/NotificationPanel";
import { useSubscriptionStatus } from "../../../hooks/useSubscription";
import { AiUpgradeModal } from "../../AI";
import { useTheme } from "../../../context/ThemeContext";

type HeaderProps = {
	collapsed?: boolean;
};

export default function Header({ collapsed = false }: HeaderProps) {
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const { data: user } = useMe();
	const { data: subStatus } = useSubscriptionStatus();
	const [modalOpen, setModalOpen] = useState(false);
	const [modalFeature, setModalFeature] = useState<
		"project_planning" | "description_generation"
	>("project_planning");
	const { resolvedTheme, setTheme } = useTheme();
	const updateSettings = useUpdateMySettings();

	const handleLogout = async () => {
		await logoutUser();
		navigate("/", { replace: true });
	};

	// Close menu when clicking outside
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<Fragment>
			<header
				className="fixed top-0 h-header-h bg-surface/80 backdrop-blur-md border-b border-border-low flex items-center justify-between px-6 z-40 transition-[width] duration-300 ltr:right-0 rtl:left-0"
				style={{
					width: `calc(100% - ${collapsed ? "var(--spacing-sidebar-c)" : "var(--spacing-sidebar-w)"})`,
				}}
			>
				{/* Slogan */}
				<div className="flex items-center w-full max-w-2xl">
					<div className="flex items-center gap-4 w-full">
						{/* Text */}
						<div className="flex gap-2 text-lg font-light tracking-wide text-on-surface-variant whitespace-nowrap">
							{i18n.language === 'ar' ? (
								<>
									<span>منصة</span>
									<span className="font-semibold bg-gradient-to-r from-electric-blue to-primary bg-clip-text text-transparent">
										تنسيق الفرق
									</span>
									<span>الذكية</span>
								</>
							) : (
								<>
									<span>Intelligent Team</span>
									<span className="font-semibold bg-gradient-to-r from-electric-blue to-primary bg-clip-text text-transparent">
										Orchestration
									</span>
									<span>Platform</span>
								</>
							)}
						</div>
						
						{/* Right Line (Left in RTL) */}
						<div className="relative flex-1 h-1 bg-gradient-to-r from-primary/70 via-primary/50 to-transparent ltr:block rtl:hidden">
							<div className="absolute top-[-2px] left-0 w-24 h-[6px] rounded-full bg-electric-blue/80 blur-[5px]"></div>
						</div>
						
						{/* Left Line (for RTL only) */}
						<div className="relative flex-1 h-1 bg-gradient-to-l from-primary/70 via-primary/50 to-transparent rtl:block ltr:hidden">
							<div className="absolute top-[-2px] right-0 w-24 h-[6px] rounded-full bg-electric-blue/80 blur-[5px]"></div>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-4">
					{/* Dynamic AI Subscription / Usage Badge */}
					{(() => {
						const used = subStatus?.aiPlans?.used ?? 0;
						const limit = subStatus?.aiPlans?.limit ?? 3;
						const isPro = subStatus?.tier === "pro";

						if (isPro) {
							return (
								<button
									onClick={() => navigate("/settings?section=billing")}
									className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-linear-to-r from-purple-600/20 to-electric-blue/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold tracking-wider cursor-pointer hover:from-purple-600/30 hover:to-electric-blue/30 transition-all shadow-[0_0_8px_rgba(168,85,247,0.15)]"
								>
									<span className="material-symbols-outlined text-[14px] text-purple-400">
										auto_awesome
									</span>
									Pro Plan
								</button>
							);
						}

						const isWarning = used === limit - 1;
						const isLimitReached = used >= limit;

						let badgeClass =
							"bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
						let iconClass = "text-emerald-400";

						if (isLimitReached) {
							badgeClass =
								"bg-red-500/10 border-red-500/20 text-red-400 animate-pulse";
							iconClass = "text-red-400";
						} else if (isWarning) {
							badgeClass = "bg-amber-500/10 border-amber-500/20 text-amber-400";
							iconClass = "text-amber-400";
						}

						return (
							<button
								onClick={() => {
									setModalFeature("project_planning");
									setModalOpen(true);
								}}
								className={`flex items-center gap-1.5 py-1 px-3.5 rounded-full border text-[11px] font-semibold tracking-wider cursor-pointer transition-all hover:bg-opacity-20 ${badgeClass}`}
							>
								<span
									className={`material-symbols-outlined text-[14px] ${iconClass}`}
								>
									auto_awesome
								</span>
								AI: {used}/{limit}
							</button>
						);
					})()}

					{/* Theme Toggle */}
					<button
						onClick={() => {
							const newTheme = resolvedTheme === "dark" ? "light" : "dark";
							setTheme(newTheme);
							updateSettings.mutate({ theme: newTheme as any });
						}}
						className="text-on-surface-variant p-1.5 rounded-sm hover:text-primary transition-colors duration-150 cursor-pointer flex items-center justify-center"
						title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
					>
						<span className="material-symbols-outlined">
							{resolvedTheme === "dark" ? "light_mode" : "dark_mode"}
						</span>
					</button>

					{/* Notification Bell + Panel */}
					<NotificationPanel />

					{/* Profile dropdown */}
					<div className="relative" ref={menuRef}>
						<button
							className="w-8 h-8 rounded-full bg-electric-blue/20 border border-electric-blue/40 flex items-center justify-center text-electric-blue font-heading font-bold text-xs hover:bg-electric-blue/30 transition-colors cursor-pointer overflow-hidden"
							onClick={() => setMenuOpen((v) => !v)}
							title="Account menu"
						>
							{user?.avatarUrl ? (
								<img
									src={user.avatarUrl}
									alt={user.fullName}
									className="w-full h-full object-cover"
								/>
							) : user?.fullName ? (
								<span>
									{user.fullName
										.split(" ")
										.map((n: string) => n[0])
										.join("")
										.slice(0, 2)
										.toUpperCase()}
								</span>
							) : (
								<span className="material-symbols-outlined text-[18px]">
									person
								</span>
							)}
						</button>

						{menuOpen && (
							<div className="absolute top-11 w-52 bg-surface-container-low border border-border-low rounded-xl shadow-2xl overflow-hidden z-50 ltr:right-0 rtl:left-0">
								{/* User info */}
								<div className="px-4 py-3 border-b border-border-low">
									<p className="text-sm font-heading font-semibold text-on-surface truncate">
										{user?.fullName || "User"}
									</p>
									<p className="text-xs text-on-surface-variant truncate mt-0.5">
										{user?.email || "—"}
									</p>
								</div>

								{/* Menu items */}
								<button
									className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-glass hover:text-on-surface transition-colors cursor-pointer"
									onClick={() => {
										setMenuOpen(false);
										navigate("/dashboard");
									}}
								>
									<span className="material-symbols-outlined text-[18px]">
										dashboard
									</span>
									Dashboard
								</button>

								<button
									className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-glass hover:text-on-surface transition-colors cursor-pointer"
									onClick={() => {
										setMenuOpen(false);
										navigate("/settings");
									}}
								>
									<span className="material-symbols-outlined text-[18px]">
										settings
									</span>
									Settings
								</button>

								<div className="border-t border-border-low mt-1" />

								<button
									className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors cursor-pointer"
									onClick={handleLogout}
								>
									<span className="material-symbols-outlined text-[18px]">
										logout
									</span>
									Sign Out
								</button>
							</div>
						)}
					</div>
				</div>
			</header>
			<AiUpgradeModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				feature={modalFeature}
			/>
		</Fragment>
	);
}
