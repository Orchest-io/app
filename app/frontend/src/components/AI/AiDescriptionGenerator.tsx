import { useState } from "react";
import { toast } from "sonner";
import { generateDescription } from "../../api/ai.api";
import AiUpgradeModal from "./AiUpgradeModal";

interface AiDescriptionGeneratorProps {
	value: string;
	onChange: (value: string) => void;
	context: string;
	type: "task" | "project";
	label?: string;
	placeholder?: string;
	rows?: number;
	className?: string;
}

export default function AiDescriptionGenerator({
	value,
	onChange,
	context,
	type,
	label,
	placeholder,
	rows = 4,
	className = "",
}: AiDescriptionGeneratorProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [showUpgradeModal, setShowUpgradeModal] = useState(false);

	const handleGenerate = async () => {
		if (!context.trim()) {
			toast.warning(
				`Please enter a ${type} title or some context first to guide the AI.`,
			);
			return;
		}

		setIsGenerating(true);
		try {
			await generateDescription(context, type);
			toast.success("Description generated!");
		} catch (error: any) {
			console.error("AI generation error:", error);
			const status = error.response?.status;
			const data = error.response?.data;

			if (status === 403 && data?.code === "AI_LIMIT_REACHED") {
				setShowUpgradeModal(true);
			} else if (status === 501) {
				toast.info(
					"✨ AI Description Generator is coming soon! (Quota checked successfully)",
				);
			} else {
				toast.error(data?.message || "Failed to generate description with AI.");
			}
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className={`flex flex-col gap-1.5 relative ${className}`}>
			{label && (
				<div className="flex justify-between items-center">
					<label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
						{label}
					</label>
				</div>
			)}

			<div className="relative group/ai-container">
				<textarea
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					rows={rows}
					className="w-full py-3 px-4 pb-12 bg-surface-container-low border border-border-low rounded-xl text-on-surface text-sm resize-y transition-colors duration-150 placeholder:text-on-surface-variant/40 focus:border-electric-blue/50 focus:shadow-[0_0_0_2px_rgba(0,123,255,0.15)] outline-none custom-scrollbar"
				/>

				<div className="absolute right-3 bottom-3 z-10">
					<button
						type="button"
						onClick={handleGenerate}
						disabled={isGenerating}
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-linear-to-r from-purple-600/80 to-electric-blue/80 hover:from-purple-500 hover:to-blue-400 text-white shadow-md shadow-purple-500/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						{isGenerating ? (
							<>
								<div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								Generating...
							</>
						) : (
							<>
								<span className="material-symbols-outlined text-[14px]">
									auto_awesome
								</span>
								Generate with AI
							</>
						)}
					</button>
				</div>
			</div>

			<AiUpgradeModal
				open={showUpgradeModal}
				onClose={() => setShowUpgradeModal(false)}
				feature="description_generation"
			/>
		</div>
	);
}
