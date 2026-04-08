import { useEffect, useState } from "react"
import "./App.css"

const REDIRECT_URL = "https://criccheer.com/standings?tab=simulator"
const REDIRECT_SECONDS = 6

// Fire a Google Analytics event for the redirect.
// Safe to call even if gtag hasn't loaded yet.
function trackRedirect(trigger) {
	if (typeof window === "undefined") return
	if (typeof window.gtag !== "function") return
	window.gtag("event", "redirect_to_criccheer", {
		event_category: "migration",
		event_label: trigger,
		trigger,
	})
}

// CricCheer dark theme palette
const COLORS = {
	bg: "#0f0d1a", // deep dark background
	bgAlt: "#15122a", // card / subtle surface
	border: "rgba(124, 106, 239, 0.15)", // primary-tinted border
	primary: "#7c6aef", // primary purple
	primaryHover: "#4c3db5", // primary hover
	accent: "#f97316", // tangerine accent
	textPrimary: "#f5f3ff", // near-white
	textSecondary: "#a8a3c7", // muted lavender
	textMuted: "#6b6690", // dim
}

function App() {
	const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)

	// Countdown + auto-redirect
	useEffect(() => {
		if (secondsLeft <= 0) {
			trackRedirect("countdown")
			window.location.href = REDIRECT_URL
			return
		}
		const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
		return () => clearTimeout(timer)
	}, [secondsLeft])

	// Force dark mode to match CricCheer
	useEffect(() => {
		document.documentElement.classList.add("dark")
		document.body.style.backgroundColor = COLORS.bg
		document.body.style.color = COLORS.textPrimary
	}, [])

	return (
		<div
			className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
			style={{
				background: `radial-gradient(ellipse at top, ${COLORS.bgAlt} 0%, ${COLORS.bg} 60%)`,
			}}
		>
			{/* Ambient glow */}
			<div
				className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 pointer-events-none"
				style={{ backgroundColor: COLORS.primary }}
			/>

			<div className="max-w-xl w-full text-center relative z-10">
				{/* Cricket ball icon with primary ring */}
				<div className="mb-6 inline-flex items-center justify-center">
					<div
						className="relative h-20 w-20 rounded-full shadow-xl flex items-center justify-center"
						style={{
							background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
							boxShadow: `0 0 40px ${COLORS.primary}40`,
						}}
					>
						<div className="absolute inset-2 rounded-full border-2 border-white/20" />
						<span className="text-4xl">🏏</span>
					</div>
				</div>

				{/* Heading */}
				<h1
					className="text-4xl sm:text-5xl font-bold mb-4"
					style={{ color: COLORS.textPrimary }}
				>
					We've moved!
				</h1>

				<p className="text-lg mb-2" style={{ color: COLORS.textSecondary }}>
					IPL Scenarios is now part of{" "}
					<span className="font-bold" style={{ color: COLORS.primary }}>
						CricCheer
					</span>
				</p>

				<p className="text-base mb-8" style={{ color: COLORS.textMuted }}>
					Same simulator you love, plus predictions, evolution charts, qualification
					probabilities, and more — all in one place.
				</p>

				{/* Feature highlights */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
					{[
						{ icon: "📊", label: "Live Standings" },
						{ icon: "🎯", label: "Predictions" },
						{ icon: "🎲", label: "Simulator" },
						{ icon: "📈", label: "Probabilities" },
					].map((f) => (
						<div
							key={f.label}
							className="backdrop-blur-sm rounded-lg p-3 border transition-all duration-200 hover:scale-105"
							style={{
								backgroundColor: `${COLORS.primary}0d`,
								borderColor: COLORS.border,
							}}
						>
							<div className="text-2xl mb-1">{f.icon}</div>
							<div
								className="text-xs font-medium"
								style={{ color: COLORS.textSecondary }}
							>
								{f.label}
							</div>
						</div>
					))}
				</div>

				{/* CTA button */}
				<a
					href={REDIRECT_URL}
					onClick={() => trackRedirect("cta_click")}
					className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-2xl hover:scale-[1.02]"
					style={{
						backgroundColor: COLORS.primary,
						boxShadow: `0 10px 30px -10px ${COLORS.primary}80`,
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = COLORS.primaryHover
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = COLORS.primary
					}}
				>
					Take me there now
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
							clipRule="evenodd"
						/>
					</svg>
				</a>

				{/* Countdown */}
				<p className="mt-6 text-sm" style={{ color: COLORS.textMuted }}>
					Redirecting in{" "}
					<span className="font-bold" style={{ color: COLORS.accent }}>
						{secondsLeft}
					</span>{" "}
					{secondsLeft === 1 ? "second" : "seconds"}...
				</p>

				{/* Footer */}
				<footer className="mt-12 text-xs" style={{ color: COLORS.textMuted }}>
					<p>
						Made by a RCB fan with ❤️ and 😰 since 2022. Report any issues/feedback at{" "}
						<a
							href="https://x.com/rakesh_katti"
							className="hover:underline"
							style={{ color: COLORS.primary }}
						>
							@rakesh_katti
						</a>
					</p>
				</footer>
			</div>
		</div>
	)
}

export default App
