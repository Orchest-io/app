import { useState, useRef } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { Button, Card, Input, Toggle, Select } from "../../components/ui";
import {
	useMe,
	useUpdateMe,
	useUpdateMySettings,
	useChangePassword,
	useSessions,
	useRevokeSession,
	useRevokeAllSessions,
	useDeleteAccount,
	useActivityLogs,
} from "../../hooks/useSettings";
import { useAiUsage } from "../../hooks/useAiUsage";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useUploadAvatar } from "../../hooks/useAttachments";
import {
	useSubscriptionStatus,
	useStartCheckout,
	useOpenPortal,
} from "../../hooks/useSubscription";

// ─── Section IDs ──────────────────────────────────────────────────
type SectionId =
	| "profile"
	| "workspace"
	| "notifications"
	| "ai"
	| "security"
	| "billing"
	| "activity";
// | "api"

const NAV_ITEMS: { id: SectionId; label: string; icon: string }[] = [
	{ id: "profile", label: "Profile", icon: "person" },
	{ id: "workspace", label: "Workspace", icon: "table_chart" },
	{ id: "notifications", label: "Notifications", icon: "notifications" },
	{ id: "ai", label: "AI Preferences", icon: "auto_awesome" },
	{ id: "security", label: "Security & Sessions", icon: "shield" },
	{ id: "billing", label: "Billing", icon: "credit_card" },
	{ id: "activity", label: "Activity Logs", icon: "history" },
	// { id: "api", label: "API Integrations", icon: "data_object" },
];

// ─── Shared section header ─────────────────────────────────────────
function SectionHeader({ title, desc }: { title: string; desc: string }) {
	return (
		<div className="mb-8">
			<h2 className="font-heading text-[26px] font-semibold text-on-surface">
				{title}
			</h2>
			<p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
				{desc}
			</p>
		</div>
	);
}

// ─── Profile Section ──────────────────────────────────────────────
function ProfileSection() {
	const { t } = useTranslation();
	const { data: user, isLoading } = useMe();
	const updateMe = useUpdateMe();
	const uploadAvatar = useUploadAvatar();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [fullName, setFullName] = useState("");
	const [roleTitle, setRoleTitle] = useState("");
	const [hasInit, setHasInit] = useState(false);

	if (!hasInit && user) {
		setFullName(user.fullName ?? "");
		setRoleTitle((user as any).roleTitle ?? "");
		setHasInit(true);
	}

	const handleSave = (e: FormEvent) => {
		e.preventDefault();
		if (!fullName.trim()) {
			toast.error(t("settings.fullNameRequired"));
			return;
		}
		updateMe.mutate(
			{ fullName: fullName.trim(), ...(roleTitle ? { roleTitle } : {}) },
			{
				onSuccess: () => toast.success(t("settings.profileUpdated")),
				onError: () => toast.error(t("settings.profileUpdateFailed")),
			},
		);
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error(t("settings.mustBeImage"));
			return;
		}

		const maxSizeBytes = 2 * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			toast.error(t("settings.avatarSizeLimit"));
			return;
		}

		uploadAvatar.mutate(file, {
			onSuccess: () => toast.success(t("settings.avatarSuccess")),
			onError: (err: any) => {
				toast.error(err.response?.data?.message || t("settings.avatarFailed"));
			},
		});
	};

	return (
		<div>
			<SectionHeader
				title={t("settings.profileTitle")}
				desc={t("settings.profileDesc")}
			/>

			{/* Avatar */}
			<Card className="mb-6">
				<div className="flex items-center gap-6">
					<input
						type="file"
						ref={fileInputRef}
						className="hidden"
						accept="image/*"
						onChange={handleAvatarChange}
					/>
					{user?.avatarUrl ? (
						<img
							src={user.avatarUrl}
							alt={user.fullName}
							className="w-20 h-20 rounded-full object-cover shrink-0 border border-border-low"
						/>
					) : (
						<div className="w-20 h-20 rounded-full bg-linear-to-br from-electric-blue to-peri-purple flex items-center justify-center text-white font-heading font-bold text-2xl shrink-0">
							{user?.fullName
								?.split(" ")
								.map((n) => n[0])
								.join("")
								.slice(0, 2) ?? "?"}
						</div>
					)}
					<div>
						<p className="font-heading text-base font-semibold text-on-surface">
							{isLoading ? t("settings.loading") : (user?.fullName ?? "—")}
						</p>
						<p className="text-xs text-on-surface-variant mt-0.5">
							{user?.email ?? ""}
						</p>
						<Button
							size="sm"
							variant="secondary"
							className="mt-3"
							onClick={() => fileInputRef.current?.click()}
							disabled={uploadAvatar.isPending}
						>
							{uploadAvatar.isPending
								? t("settings.uploading")
								: t("settings.changePhoto")}
						</Button>
					</div>
				</div>
			</Card>

			{/* Form */}
			<Card>
				<form className="flex flex-col gap-5" onSubmit={handleSave}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<Input
							label={t("settings.fullName")}
							icon="person"
							placeholder={t("settings.fullNamePlaceholder")}
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							disabled={updateMe.isPending}
						/>
						<Input
							label={t("settings.emailAddress")}
							icon="mail"
							placeholder="your@email.com"
							value={user?.email ?? ""}
							disabled
							className="opacity-60"
						/>
					</div>
					<Input
						label={t("settings.roleTitle")}
						icon="badge"
						placeholder={t("settings.rolePlaceholder")}
						value={roleTitle}
						onChange={(e) => setRoleTitle(e.target.value)}
						disabled={updateMe.isPending}
					/>
					<div className="flex justify-end">
						<Button type="submit" disabled={updateMe.isPending}>
							{updateMe.isPending
								? t("settings.saving")
								: t("settings.saveChanges")}
						</Button>
					</div>
				</form>
			</Card>
		</div>
	);
}

// ─── Workspace Section ────────────────────────────────────────────
function WorkspaceSection() {
	const { data: user } = useMe();
	const updateSettings = useUpdateMySettings();
	const { setTheme } = useTheme();
	const { t, i18n } = useTranslation();

	const settings = (user as any)?.settings;

	return (
		<div>
			<SectionHeader
				title={t("settings.workspaceTitle")}
				desc={t("settings.workspaceDesc")}
			/>

			<Card className="flex flex-col gap-6">
				<Select
					label={t("settings.theme")}
					value={settings?.theme ?? "dark"}
					onChange={(e) => {
						const newTheme = e.target.value as any;
						setTheme(newTheme);
						updateSettings.mutate(
							{ theme: newTheme },
							{ onSuccess: () => toast.success(t("settings.themeUpdated")) },
						);
					}}
					options={[
						{ value: "dark", label: t("settings.themeDark") },
						{ value: "light", label: t("settings.themeLight") },
						{ value: "system", label: t("settings.themeSystem") },
					]}
				/>

				<Select
					label={t("settings.language")}
					value={settings?.language ?? "en"}
					onChange={(e) => {
						const newLang = e.target.value;
						i18n.changeLanguage(newLang);
						localStorage.setItem("language", newLang);
						updateSettings.mutate(
							{ language: newLang },
							{ onSuccess: () => toast.success(t("settings.languageUpdated")) },
						);
					}}
					options={[
						{ value: "en", label: t("settings.langEN") },
						{ value: "ar", label: t("settings.langAR") },
					]}
				/>
			</Card>
		</div>
	);
}

// ─── Notifications Section ────────────────────────────────────────
function NotificationsSection() {
	const { t } = useTranslation();
	const { data: user } = useMe();
	const updateSettings = useUpdateMySettings();
	const settings = (user as any)?.settings;

	const toggle = (
		key: "emailNotifications" | "pushNotifications",
		val: boolean,
	) => {
		updateSettings.mutate(
			{ [key]: val },
			{ onSuccess: () => toast.success(t("settings.preferenceSaved")) },
		);
	};

	const rows = [
		{
			key: "emailNotifications" as const,
			label: t("settings.emailNotifications"),
			desc: t("settings.emailNotificationsDesc"),
			icon: "mail",
		},
		{
			key: "pushNotifications" as const,
			label: t("settings.pushNotifications"),
			desc: t("settings.pushNotificationsDesc"),
			icon: "notifications",
		},
	];

	return (
		<div>
			<SectionHeader
				title={t("settings.notificationsTitle")}
				desc={t("settings.notificationsDesc")}
			/>

			<Card className="flex flex-col divide-y divide-border-low">
				{rows.map(({ key, label, desc, icon }) => (
					<div
						key={key}
						className="flex items-center justify-between py-5 first:pt-0 last:pb-0"
					>
						<div className="flex items-start gap-4">
							<div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
								<span className="material-symbols-outlined text-[20px]">
									{icon}
								</span>
							</div>
							<div>
								<p className="font-heading text-sm font-semibold text-on-surface">
									{label}
								</p>
								<p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
							</div>
						</div>
						<Toggle
							checked={settings?.[key] ?? true}
							onChange={(e) => toggle(key, e.target.checked)}
							disabled={updateSettings.isPending}
						/>
					</div>
				))}
			</Card>

			{/* Weekly Reports */}
			<Card className="mt-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-heading text-sm font-semibold text-on-surface">
							{t("settings.weeklyReports")}
						</p>
						<p className="text-xs text-on-surface-variant mt-0.5">
							{t("settings.weeklyReportsDesc")}
						</p>
					</div>
					<Toggle
						checked={settings?.weeklyReports ?? false}
						onChange={(e) =>
							updateSettings.mutate(
								{ weeklyReports: e.target.checked },
								{
									onSuccess: () => toast.success(t("settings.preferenceSaved")),
								},
							)
						}
						disabled={updateSettings.isPending}
					/>
				</div>
			</Card>
		</div>
	);
}

// ─── AI Preferences Section ───────────────────────────────────────
function AiSection() {
	const { t } = useTranslation();
	const { data: user } = useMe();
	const updateSettings = useUpdateMySettings();
	const { data: aiUsage, isLoading: usageLoading } = useAiUsage();
	const settings = (user as any)?.settings;

	const rows = [
		{
			key: "aiSuggestions",
			label: t("settings.aiSuggestions"),
			desc: t("settings.aiSuggestionsDesc"),
			icon: "auto_awesome",
		},
		{
			key: "aiRisk",
			label: t("settings.aiRisk"),
			desc: t("settings.aiRiskDesc"),
			icon: "warning",
		},
		{
			key: "aiCopilot",
			label: t("settings.aiCopilot"),
			desc: t("settings.aiCopilotDesc"),
			icon: "smart_toy",
		},
	];

	const usagePercent = aiUsage
		? Math.round((aiUsage.used / aiUsage.limit) * 100)
		: 0;
	const usageColor =
		usagePercent >= 100
			? "text-error"
			: usagePercent >= 80
				? "text-amber-400"
				: "text-emerald-400";
	const barColor =
		usagePercent >= 100
			? "bg-error"
			: usagePercent >= 80
				? "bg-amber-400"
				: "bg-emerald-400";

	return (
		<div>
			<SectionHeader
				title={t("settings.aiTitle")}
				desc={t("settings.aiDesc")}
			/>

			{/* AI Usage Counter Card */}
			<Card className="mb-6 bg-peri-purple/5 border-peri-purple/20">
				<div className="flex items-start justify-between mb-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-peri-purple/15 flex items-center justify-center text-peri-purple shrink-0">
							<span
								className="material-symbols-outlined text-[22px]"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								psychology
							</span>
						</div>
						<div>
							<p className="font-heading text-sm font-semibold text-on-surface">
								{t("settings.aiProjectPlanning")}
							</p>
							<p className="text-xs text-on-surface-variant mt-0.5">
								{t("settings.monthlyUsageLimit")}
							</p>
						</div>
					</div>
					{aiUsage && (
						<span
							className={`px-2.5 py-1 rounded-full ${usagePercent >= 100 ? "bg-error/10 text-error" : "bg-emerald-500/10 text-emerald-400"} text-[10px] font-heading font-bold uppercase tracking-wider shrink-0`}
						>
							{aiUsage.canUse
								? t("settings.available")
								: t("settings.limitReached")}
						</span>
					)}
				</div>

				{usageLoading ? (
					<div className="h-16 flex items-center justify-center">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-peri-purple"></div>
					</div>
				) : aiUsage ? (
					<>
						<div className="flex items-end justify-between mb-2">
							<p className="text-2xl font-heading font-bold text-on-surface">
								{aiUsage.used}{" "}
								<span className="text-sm text-on-surface-variant font-normal">
									/ {aiUsage.limit}
								</span>
							</p>
							<p className={`text-xs font-semibold ${usageColor}`}>
								{usagePercent}% {t("settings.used")}
							</p>
						</div>
						<div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
							<div
								className={`h-full ${barColor} transition-all duration-300 rounded-full`}
								style={{ width: `${Math.min(usagePercent, 100)}%` }}
							/>
						</div>
						<p className="text-xs text-on-surface-variant mt-3">
							{aiUsage.canUse
								? t("settings.aiPlansRemaining", {
										count: aiUsage.limit - aiUsage.used,
									})
								: t("settings.resetsOn", {
										date: new Date(aiUsage.resetsAt).toLocaleDateString(),
									})}
						</p>
					</>
				) : (
					<p className="text-xs text-on-surface-variant">
						{t("settings.failedLoadUsage")}
					</p>
				)}
			</Card>

			{/* AI Toggles */}
			<Card className="flex flex-col divide-y divide-border-low mb-6">
				{rows.map(({ key, label, desc, icon }) => (
					<div
						key={key}
						className="flex items-center justify-between py-5 first:pt-0 last:pb-0"
					>
						<div className="flex items-start gap-4">
							<div className="w-9 h-9 rounded-lg bg-peri-purple/10 flex items-center justify-center text-peri-purple">
								<span className="material-symbols-outlined text-[20px]">
									{icon}
								</span>
							</div>
							<div>
								<p className="font-heading text-sm font-semibold text-on-surface">
									{label}
								</p>
								<p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
							</div>
						</div>
						<Toggle
							checked={
								key === "aiSuggestions"
									? (settings?.aiSuggestions ?? true)
									: true
							}
							onChange={(e) => {
								if (key === "aiSuggestions") {
									updateSettings.mutate(
										{ aiSuggestions: e.target.checked },
										{
											onSuccess: () =>
												toast.success(t("settings.preferenceSaved")),
										},
									);
								} else {
									toast.info(t("settings.comingSoon"));
								}
							}}
							disabled={updateSettings.isPending}
						/>
					</div>
				))}
			</Card>

			{/* AI model info */}
			<Card className="flex items-center gap-4 bg-electric-blue/5 border-electric-blue/20">
				<div className="w-10 h-10 rounded-full bg-electric-blue/15 flex items-center justify-center text-electric-blue shrink-0">
					<span
						className="material-symbols-outlined text-[22px]"
						style={{ fontVariationSettings: "'FILL' 1" }}
					>
						hub
					</span>
				</div>
				<div>
					<p className="font-heading text-sm font-semibold text-on-surface">
						{t("settings.poweredByOpenAI")}
					</p>
					<p className="text-xs text-on-surface-variant mt-0.5">
						{t("settings.aiModelDesc")}
					</p>
				</div>
				<span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-heading font-bold uppercase tracking-wider shrink-0">
					{t("settings.active")}
				</span>
			</Card>
		</div>
	);
}

// ─── Security Section ─────────────────────────────────────────────
function SecuritySection() {
	const { t } = useTranslation();
	const { data: user } = useMe();
	const { data: sessions, isLoading: sessionsLoading } = useSessions();
	const revokeSessionMutation = useRevokeSession();
	const revokeAllMutation = useRevokeAllSessions();
	const changePassword = useChangePassword();
	const deleteAccountMutation = useDeleteAccount();
	const updateSettings = useUpdateMySettings();
	const settings = (user as any)?.settings;

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletePassword, setDeletePassword] = useState("");

	const handleChangePassword = (e: FormEvent) => {
		e.preventDefault();
		if (!newPassword || newPassword.length < 8) {
			toast.error(t("settings.passwordMinLength"));
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error(t("settings.passwordsNoMatch"));
			return;
		}
		changePassword.mutate(
			{ currentPassword, newPassword },
			{
				onSuccess: () => {
					toast.success(t("settings.passwordUpdated"));
					setCurrentPassword("");
					setNewPassword("");
					setConfirmPassword("");
				},
				onError: (error: any) => {
					const message =
						error?.response?.data?.message ||
						t("settings.passwordUpdateFailed");
					toast.error(message);
				},
			},
		);
	};

	const handleRevokeSession = (sessionId: string) => {
		revokeSessionMutation.mutate(sessionId, {
			onSuccess: () => toast.success(t("settings.sessionRevoked")),
			onError: () => toast.error(t("settings.sessionRevokeFailed")),
		});
	};

	const handleRevokeAll = () => {
		const currentSessionId = sessions?.[0]?.id || "";
		revokeAllMutation.mutate(currentSessionId, {
			onSuccess: () => toast.success(t("settings.allSessionsRevoked")),
			onError: () => toast.error(t("settings.allSessionsRevokeFailed")),
		});
	};

	const handleDeleteAccount = (e: FormEvent) => {
		e.preventDefault();
		if (!deletePassword) {
			toast.error(t("settings.enterPassword"));
			return;
		}
		deleteAccountMutation.mutate(deletePassword, {
			onSuccess: () => {
				toast.success(t("settings.accountDeleted"));
				localStorage.clear();
				window.location.href = "/login";
			},
			onError: (error: any) => {
				const message =
					error?.response?.data?.message || t("settings.accountDeleteFailed");
				toast.error(message);
			},
		});
	};

	const timeAgo = (date: string) => {
		const diff = Date.now() - new Date(date).getTime();
		const minutes = Math.floor(diff / 60000);
		if (minutes < 1) return t("settings.activeNow");
		if (minutes < 60) return t("settings.minAgo", { count: minutes });
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return t("settings.hourAgo", { count: hours });
		const days = Math.floor(hours / 24);
		return t("settings.dayAgo", { count: days });
	};

	return (
		<div>
			<SectionHeader
				title={t("settings.securityTitle")}
				desc={t("settings.securityDesc")}
			/>

			{/* 2FA + Password cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
				<Card className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-electric-blue/10 flex items-center justify-center text-electric-blue">
							<span
								className="material-symbols-outlined text-[22px]"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								phone_iphone
							</span>
						</div>
						<div className="flex-1">
							<p className="font-heading text-sm font-bold text-on-surface">
								{t("settings.twoFactorAuth")}
							</p>
						</div>
						<span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-heading font-bold uppercase tracking-wider">
							{settings?.twoFactorEnabled ? t("settings.active") : "Off"}
						</span>
					</div>
					<p className="text-xs text-on-surface-variant leading-relaxed">
						{settings?.twoFactorEnabled
							? t("settings.twoFactorActiveDesc")
							: t("settings.twoFactorInactiveDesc")}
					</p>
					<Button
						size="sm"
						variant="secondary"
						onClick={() =>
							updateSettings.mutate(
								{ twoFactorEnabled: !settings?.twoFactorEnabled },
								{ onSuccess: () => toast.success(t("settings.twoFAUpdated")) },
							)
						}
					>
						{settings?.twoFactorEnabled
							? t("settings.disable2FA")
							: t("settings.enable2FA")}
					</Button>
				</Card>

				<Card className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
							<span className="material-symbols-outlined text-[22px]">key</span>
						</div>
						<p className="font-heading text-sm font-bold text-on-surface">
							{t("settings.passwordManagement")}
						</p>
					</div>
					<p className="text-xs text-on-surface-variant leading-relaxed">
						{t("settings.passwordManagementDesc")}
					</p>
					<Button
						size="sm"
						variant="secondary"
						onClick={() =>
							document
								.getElementById("change-password-form")
								?.scrollIntoView({ behavior: "smooth" })
						}
					>
						{t("settings.changePassword")}
					</Button>
				</Card>
			</div>

			{/* Change password form */}
			<Card className="mb-6" id="change-password-form">
				<h3 className="font-heading text-base font-semibold text-on-surface mb-5">
					{t("settings.changePassword")}
				</h3>
				<form className="flex flex-col gap-4" onSubmit={handleChangePassword}>
					<Input
						label={t("settings.currentPassword")}
						icon="lock"
						type="password"
						placeholder="••••••••"
						value={currentPassword}
						onChange={(e) => setCurrentPassword(e.target.value)}
						disabled={changePassword.isPending}
					/>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label={t("settings.newPassword")}
							icon="lock_reset"
							type="password"
							placeholder={t("settings.newPasswordPlaceholder")}
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							disabled={changePassword.isPending}
						/>
						<Input
							label={t("settings.confirmPassword")}
							icon="lock_reset"
							type="password"
							placeholder={t("settings.confirmPasswordPlaceholder")}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={changePassword.isPending}
							error={
								confirmPassword && confirmPassword !== newPassword
									? t("settings.passwordsNoMatch")
									: undefined
							}
						/>
					</div>
					<div className="flex justify-end">
						<Button type="submit" disabled={changePassword.isPending}>
							{changePassword.isPending
								? t("settings.updating")
								: t("settings.updatePassword")}
						</Button>
					</div>
				</form>
			</Card>

			{/* Active sessions */}
			<Card>
				<div className="flex items-center justify-between mb-5">
					<h3 className="font-heading text-base font-semibold text-on-surface">
						{t("settings.activeSessions")}
					</h3>
					<button
						className="text-xs font-semibold text-error hover:underline cursor-pointer disabled:opacity-50"
						onClick={handleRevokeAll}
						disabled={
							revokeAllMutation.isPending || !sessions || sessions.length <= 1
						}
					>
						{t("settings.revokeAllOther")}
					</button>
				</div>

				{sessionsLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue"></div>
					</div>
				) : sessions && sessions.length > 0 ? (
					<div className="flex flex-col gap-3">
						{sessions.map((session: any, index: number) => {
							const isCurrent = index === 0;
							const deviceIcon = session.deviceInfo
								?.toLowerCase()
								.includes("mobile")
								? "smartphone"
								: "computer";

							return (
								<div
									key={session.id}
									className={`flex items-center justify-between p-4 rounded-lg border ${
										isCurrent
											? "border-electric-blue/30 bg-electric-blue/5"
											: "border-border-low bg-surface-container-low"
									}`}
								>
									<div className="flex items-center gap-3">
										<span className="material-symbols-outlined text-on-surface-variant text-[22px]">
											{deviceIcon}
										</span>
										<div>
											<div className="flex items-center gap-2">
												<p className="font-heading text-sm font-semibold text-on-surface">
													{session.deviceInfo || t("settings.unknownDevice")}
												</p>
												{isCurrent && (
													<span className="px-1.5 py-0.5 rounded bg-electric-blue/15 text-electric-blue text-[9px] font-heading font-bold uppercase tracking-wider">
														{t("settings.current")}
													</span>
												)}
											</div>
											<p className="text-xs text-on-surface-variant mt-0.5">
												{session.location || t("settings.unknownLocation")} ·{" "}
												{session.ipAddress || t("settings.unknownIP")}
											</p>
										</div>
									</div>
									{isCurrent ? (
										<span className="text-xs text-emerald-400 font-medium">
											{timeAgo(session.lastActiveAt)}
										</span>
									) : (
										<Button
											size="sm"
											variant="secondary"
											onClick={() => handleRevokeSession(session.id)}
											disabled={revokeSessionMutation.isPending}
										>
											{t("settings.revoke")}
										</Button>
									)}
								</div>
							);
						})}
					</div>
				) : (
					<p className="text-center text-sm text-on-surface-variant py-8">
						{t("settings.noActiveSessions")}
					</p>
				)}
			</Card>

			{/* Delete Account - Danger Zone */}
			<Card className="mt-6 border-error/20 bg-error/5">
				<div className="flex items-start justify-between">
					<div className="flex items-start gap-4">
						<div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error">
							<span className="material-symbols-outlined text-[22px]">
								warning
							</span>
						</div>
						<div>
							<h3 className="font-heading text-base font-semibold text-on-surface">
								{t("settings.dangerZone")}
							</h3>
							<p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
								{t("settings.dangerZoneDesc")}
							</p>
						</div>
					</div>
					<Button
						size="sm"
						variant="secondary"
						className="bg-error/10 border-error/20 text-error hover:bg-error/20"
						onClick={() => setShowDeleteModal(true)}
					>
						{t("settings.deleteAccount")}
					</Button>
				</div>
			</Card>

			{/* Delete Account Modal */}
			{showDeleteModal && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-surface border border-error/20 rounded-xl max-w-md w-full p-6 shadow-2xl">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error">
								<span className="material-symbols-outlined text-[24px]">
									warning
								</span>
							</div>
							<div>
								<h3 className="font-heading text-lg font-semibold text-on-surface">
									{t("settings.deleteAccountTitle")}
								</h3>
								<p className="text-xs text-on-surface-variant">
									{t("settings.deleteAccountSubtitle")}
								</p>
							</div>
						</div>

						<div className="bg-error/5 border border-error/20 rounded-lg p-4 mb-4">
							<p className="text-sm text-on-surface font-medium mb-2">
								⚠️ {t("settings.deleteWarning")}
							</p>
							<ul className="text-xs text-on-surface-variant space-y-1 list-disc list-inside">
								<li>{t("settings.deleteWarn1")}</li>
								<li>{t("settings.deleteWarn2")}</li>
								<li>{t("settings.deleteWarn3")}</li>
							</ul>
						</div>

						<form onSubmit={handleDeleteAccount} className="space-y-4">
							<Input
								label={t("settings.enterPasswordConfirm")}
								icon="lock"
								type="password"
								placeholder="••••••••"
								value={deletePassword}
								onChange={(e) => setDeletePassword(e.target.value)}
								disabled={deleteAccountMutation.isPending}
								autoFocus
							/>

							<div className="flex gap-3 justify-end pt-3">
								<Button
									type="button"
									variant="secondary"
									onClick={() => {
										setShowDeleteModal(false);
										setDeletePassword("");
									}}
									disabled={deleteAccountMutation.isPending}
								>
									{t("settings.cancel")}
								</Button>
								<Button
									type="submit"
									className="bg-error border-error hover:bg-error/90"
									disabled={deleteAccountMutation.isPending}
								>
									{deleteAccountMutation.isPending
										? t("settings.deleting")
										: t("settings.deleteMyAccount")}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

// ─── Billing Section ──────────────────────────────────────────────
function BillingSection() {
	const { t } = useTranslation();
	const { data: subStatus, isLoading } = useSubscriptionStatus();
	const checkout = useStartCheckout();
	const portal = useOpenPortal();

	const isPro = subStatus?.tier === "pro";
	const expiresAt = subStatus?.subscriptionExpiresAt
		? new Date(subStatus.subscriptionExpiresAt)
		: null;

	const PRO_FEATURES = [
		t("settings.featureMembers"),
		t("settings.featureProjects"),
		t("settings.featureAI"),
		t("settings.featureRisk"),
	];
	const FREE_FEATURES = [
		t("settings.freeMembers"),
		t("settings.freeProjects"),
		t("settings.freeAI"),
		t("settings.freeSupport"),
	];

	return (
		<div>
			<SectionHeader
				title={t("settings.billingTitle")}
				desc={t("settings.billingDesc")}
			/>

			{/* Current plan card */}
			<Card
				className={`mb-6 relative overflow-hidden ${isPro ? "border-electric-blue/25 bg-electric-blue/5" : "border-border-low"}`}
			>
				{isPro && (
					<div className="absolute top-0 right-0 w-48 h-48 bg-electric-blue/10 blur-[60px] pointer-events-none" />
				)}
				<div className="flex items-start justify-between">
					<div>
						<span
							className={`px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider ${
								isPro
									? "bg-electric-blue/20 text-electric-blue"
									: "bg-surface-container-high text-on-surface-variant"
							}`}
						>
							{t("settings.currentPlan")}
						</span>
						{isLoading ? (
							<div className="mt-3 h-8 w-32 bg-surface-container-high animate-pulse rounded" />
						) : (
							<h3 className="font-heading text-2xl font-extrabold text-on-surface mt-3">
								{isPro ? t("settings.proPlan") : t("settings.freePlan")}
							</h3>
						)}
						{isPro && expiresAt && (
							<p className="text-xs text-on-surface-variant mt-1">
								{t("settings.renewsOn", {
									date: expiresAt.toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									}),
								})}
							</p>
						)}
						{!isPro && (
							<p className="text-xs text-on-surface-variant mt-1">
								{t("settings.upgradePrompt")}
							</p>
						)}
						<ul className="mt-4 space-y-1.5">
							{(isPro ? PRO_FEATURES : FREE_FEATURES).map((f) => (
								<li
									key={f}
									className="flex items-center gap-2 text-xs text-on-surface-variant"
								>
									<span
										className={`material-symbols-outlined text-[14px] ${isPro ? "text-electric-blue" : "text-on-surface-variant"}`}
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										{isPro ? "check_circle" : "circle"}
									</span>
									{f}
								</li>
							))}
						</ul>
					</div>

					<div className="shrink-0 ml-4">
						{isLoading ? (
							<div className="h-9 w-32 bg-surface-container-high animate-pulse rounded-lg" />
						) : isPro ? (
							<Button
								variant="secondary"
								onClick={() => portal.mutate()}
								disabled={portal.isPending}
							>
								{portal.isPending
									? t("settings.opening")
									: t("settings.manageBilling")}
							</Button>
						) : (
							<Button
								onClick={() => checkout.mutate()}
								disabled={checkout.isPending}
							>
								{checkout.isPending
									? t("settings.redirecting")
									: t("settings.upgradeToPro")}
							</Button>
						)}
					</div>
				</div>
			</Card>

			{/* Upgrade prompt for free users */}
			{!isPro && !isLoading && (
				<Card className="mb-6 bg-peri-purple/5 border-peri-purple/20">
					<div className="flex items-center gap-4">
						<div className="w-10 h-10 rounded-full bg-peri-purple/15 flex items-center justify-center text-peri-purple shrink-0">
							<span
								className="material-symbols-outlined text-[22px]"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								workspace_premium
							</span>
						</div>
						<div className="flex-1">
							<p className="font-heading text-sm font-semibold text-on-surface">
								{t("settings.unlockPro")}
							</p>
							<p className="text-xs text-on-surface-variant mt-0.5">
								{t("settings.unlockProDesc")}
							</p>
						</div>
						<Button
							size="sm"
							onClick={() => checkout.mutate()}
							disabled={checkout.isPending}
						>
							{checkout.isPending
								? t("settings.redirecting")
								: t("settings.upgradePrice")}
						</Button>
					</div>
				</Card>
			)}

			{/* Billing portal note for pro users */}
			{isPro && (
				<Card className="mb-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="font-heading text-base font-semibold text-on-surface">
							{t("settings.paymentAndInvoices")}
						</h3>
						<Button
							size="sm"
							variant="secondary"
							onClick={() => portal.mutate()}
							disabled={portal.isPending}
						>
							{portal.isPending
								? t("settings.opening")
								: t("settings.openBillingPortal")}
						</Button>
					</div>
					<p className="text-xs text-on-surface-variant leading-relaxed">
						{t("settings.billingPortalDesc")}
					</p>
				</Card>
			)}
		</div>
	);
}

// ─── API Integrations Section ─────────────────────────────────────
// function ApiSection() {
// 	const INTEGRATIONS = [
// 		{
// 			name: "GitHub",
// 			icon: "code",
// 			connected: true,
// 			desc: "Sync repositories and pull requests.",
// 		},
// 		{
// 			name: "Jira",
// 			icon: "view_kanban",
// 			connected: false,
// 			desc: "Import and sync Jira issues.",
// 		},
// 		{
// 			name: "Slack",
// 			icon: "forum",
// 			connected: true,
// 			desc: "Send notifications to Slack channels.",
// 		},
// 		{
// 			name: "Notion",
// 			icon: "article",
// 			connected: false,
// 			desc: "Link Notion pages to tasks.",
// 		},
// 	];

// 	return (
// 		<div>
// 			<SectionHeader
// 				title="API Integrations"
// 				desc="Connect third-party tools to your Orchist workspace."
// 			/>

// 			{/* API Key */}
// 			<Card className="mb-6">
// 				<h3 className="font-heading text-base font-semibold text-on-surface mb-4">
// 					Personal API Key
// 				</h3>
// 				<div className="flex items-center gap-3">
// 					<div className="flex-1 px-4 py-2.5 bg-surface-container-low border border-border-low rounded-md font-mono text-sm text-on-surface-variant truncate">
// 						sk-orchist-••••••••••••••••••••••••••••
// 					</div>
// 					<Button
// 						size="sm"
// 						variant="secondary"
// 						onClick={() => toast.success("API key copied!")}
// 					>
// 						<span className="material-symbols-outlined text-[16px]">
// 							content_copy
// 						</span>
// 						Copy
// 					</Button>
// 					<Button
// 						size="sm"
// 						variant="secondary"
// 						onClick={() => toast.info("API key regenerated.")}
// 					>
// 						<span className="material-symbols-outlined text-[16px]">
// 							refresh
// 						</span>
// 						Regenerate
// 					</Button>
// 				</div>
// 				<p className="text-xs text-on-surface-variant mt-3">
// 					Keep this key secret. It grants full API access to your workspace.
// 				</p>
// 			</Card>

// 			{/* Connected apps */}
// 			<Card>
// 				<h3 className="font-heading text-base font-semibold text-on-surface mb-5">
// 					Connected Apps
// 				</h3>
// 				<div className="flex flex-col gap-4">
// 					{INTEGRATIONS.map(({ name, icon, connected, desc }) => (
// 						<div
// 							key={name}
// 							className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low border border-border-low"
// 						>
// 							<div className="flex items-center gap-4">
// 								<div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
// 									<span className="material-symbols-outlined text-[20px]">
// 										{icon}
// 									</span>
// 								</div>
// 								<div>
// 									<p className="font-heading text-sm font-semibold text-on-surface">
// 										{name}
// 									</p>
// 									<p className="text-xs text-on-surface-variant mt-0.5">
// 										{desc}
// 									</p>
// 								</div>
// 							</div>
// 							<Button
// 								size="sm"
// 								variant={connected ? "secondary" : "primary"}
// 								onClick={() => toast.info(`${name} integration coming soon.`)}
// 							>
// 								{connected ? "Disconnect" : "Connect"}
// 							</Button>
// 						</div>
// 					))}
// 				</div>
// 			</Card>
// 		</div>
// 	);
// }

// ─── Activity Logs Section ────────────────────────────────────────
function ActivitySection() {
	const { t } = useTranslation();
	const { data: logs, isLoading } = useActivityLogs();

	const getActionDisplay = (action: string, _entityType: string | null) => {
		const actionMap: Record<
			string,
			{ icon: string; color: string; label: string }
		> = {
			CREATED: {
				icon: "add_circle",
				color: "text-emerald-400",
				label: t("settings.actionCreated"),
			},
			UPDATED: {
				icon: "edit",
				color: "text-peri-purple",
				label: t("settings.actionUpdated"),
			},
			DELETED: {
				icon: "delete",
				color: "text-error",
				label: t("settings.actionDeleted"),
			},
			COMPLETED: {
				icon: "check_circle",
				color: "text-electric-blue",
				label: t("settings.actionCompleted"),
			},
			ASSIGNED: {
				icon: "person_add",
				color: "text-amber-400",
				label: t("settings.actionAssigned"),
			},
			COMMENTED: {
				icon: "chat",
				color: "text-on-surface-variant",
				label: t("settings.actionCommented"),
			},
		};
		return (
			actionMap[action] || {
				icon: "circle",
				color: "text-on-surface-variant",
				label: action,
			}
		);
	};

	const formatTime = (date: string) => {
		const now = Date.now();
		const diff = now - new Date(date).getTime();
		const minutes = Math.floor(diff / 60000);
		if (minutes < 1) return t("settings.justNow");
		if (minutes < 60) return t("settings.minAgo", { count: minutes });
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return t("settings.hourAgo", { count: hours });
		const days = Math.floor(hours / 24);
		if (days < 7) return t("settings.dayAgo", { count: days });
		return new Date(date).toLocaleDateString();
	};

	const getDescription = (log: any) => {
		const action = getActionDisplay(log.action, log.entityType);
		if (log.description) return log.description;
		const entityType = log.entityType?.toLowerCase() || "item";
		const itemName = log.metadata?.name || log.metadata?.title;
		if (itemName) return `${action.label} ${entityType} "${itemName}"`;
		return `${action.label} ${entityType}`;
	};

	return (
		<div>
			<SectionHeader
				title={t("settings.activityTitle")}
				desc={t("settings.activityDesc")}
			/>

			<Card>
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue"></div>
					</div>
				) : logs && logs.length > 0 ? (
					<div className="flex flex-col divide-y divide-border-low">
						{logs.slice(0, 20).map((log: any) => {
							const display = getActionDisplay(log.action, log.entityType);
							return (
								<div
									key={log.id}
									className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
								>
									<div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
										<span
											className={`material-symbols-outlined text-[18px] ${display.color}`}
										>
											{display.icon}
										</span>
									</div>
									<div className="flex-1">
										<p className="text-sm text-on-surface font-medium">
											{getDescription(log)}
										</p>
									</div>
									<span className="text-xs text-on-surface-variant">
										{formatTime(log.createdAt)}
									</span>
								</div>
							);
						})}
					</div>
				) : (
					<div className="text-center py-12">
						<span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-40">
							history
						</span>
						<p className="text-sm text-on-surface-variant mt-3">
							{t("settings.noActivityLogs")}
						</p>
					</div>
				)}
			</Card>
		</div>
	);
}

// ─── SECTION MAP ──────────────────────────────────────────────────
const SECTION_MAP: Record<SectionId, React.ReactNode> = {
	profile: <ProfileSection />,
	workspace: <WorkspaceSection />,
	notifications: <NotificationsSection />,
	ai: <AiSection />,
	security: <SecuritySection />,
	billing: <BillingSection />,
	// api: <ApiSection />,
	activity: <ActivitySection />,
};

// ─── Main Settings Page ───────────────────────────────────────────
export default function Settings() {
	const { t } = useTranslation();
	const [active, setActive] = useState<SectionId>("profile");

	return (
		<div className="max-w-275 mx-auto py-8">
			{/* Page header */}
			<div className="mb-8">
				<h1 className="font-heading text-[32px] font-semibold text-on-surface">
					{t("settings.title")}
				</h1>
				<p className="text-sm text-on-surface-variant mt-1">
					{t("settings.desc")}
				</p>
			</div>

			<div className="flex gap-8 items-start">
				{/* Left nav */}
				<aside className="w-55 shrink-0">
					<p className="font-heading text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-3 px-2">
						{t("settings.categories")}
					</p>
					<nav className="flex flex-col gap-0.5">
						{NAV_ITEMS.map(({ id, icon }) => (
							<button
								key={id}
								onClick={() => setActive(id)}
								className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer text-left ${
									active === id
										? "bg-secondary-container text-on-secondary-container"
										: "text-on-surface-variant hover:bg-surface-glass hover:text-on-surface"
								}`}
							>
								<span className="material-symbols-outlined text-[18px]">
									{icon}
								</span>
								{t(`settings.${id}`)}
							</button>
						))}
					</nav>
				</aside>

				{/* Content */}
				<div className="flex-1 min-w-0">{SECTION_MAP[active]}</div>
			</div>
		</div>
	);
}
