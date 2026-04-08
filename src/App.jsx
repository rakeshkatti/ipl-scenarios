import { useEffect, useState } from "react"
import "./App.css"

const REDIRECT_URL = "https://criccheer.com/standings?tab=simulator"
const REDIRECT_SECONDS = 6

function App() {
	const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)

	// Countdown + auto-redirect
	useEffect(() => {
		if (secondsLeft <= 0) {
			window.location.href = REDIRECT_URL
			return
		}
		const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
		return () => clearTimeout(timer)
	}, [secondsLeft])

	// Apply dark mode based on system preference
	useEffect(() => {
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
		if (prefersDark) {
			document.documentElement.classList.add("dark")
			document.body.style.backgroundColor = "#0f0d1a"
		}
	}, [])

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0f0d1a] dark:via-[#15122a] dark:to-[#1a0f2e] px-4">
			<div className="max-w-xl w-full text-center">
				{/* Cricket ball icon */}
				<div className="mb-6 inline-flex items-center justify-center">
					<div className="relative h-20 w-20 rounded-full bg-red-600 shadow-lg flex items-center justify-center">
						<div className="absolute inset-2 rounded-full border-2 border-white/30" />
						<span className="text-4xl">🏏</span>
					</div>
				</div>

				{/* Heading */}
				<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
					We've moved!
				</h1>

				<p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
					IPL Scenarios is now part of{" "}
					<span className="font-bold text-indigo-600 dark:text-indigo-400">
						CricCheer
					</span>
				</p>

				<p className="text-base text-gray-600 dark:text-gray-400 mb-8">
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
							className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-white/10"
						>
							<div className="text-2xl mb-1">{f.icon}</div>
							<div className="text-xs font-medium text-gray-700 dark:text-gray-300">
								{f.label}
							</div>
						</div>
					))}
				</div>

				{/* CTA button */}
				<a
					href={REDIRECT_URL}
					className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
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
				<p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
					Redirecting in <span className="font-bold">{secondsLeft}</span>{" "}
					{secondsLeft === 1 ? "second" : "seconds"}...
				</p>

				{/* Footer */}
				<footer className="mt-12 text-xs text-gray-500 dark:text-gray-500">
					<p>
						Made by a RCB fan with ❤️ and 😰 since 2022. Report any issues/feedback at{" "}
						<a
							href="https://x.com/rakesh_katti"
							className="text-indigo-600 dark:text-indigo-400 hover:underline"
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
