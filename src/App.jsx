import { useState, useEffect, createContext } from "react"
import "./App.css"
import CricScenarios from "./components/CricScenarios"

// Create a context for dark mode
export const DarkModeContext = createContext({
	darkMode: false,
	toggleDarkMode: () => {},
})

function App() {
	// State for dark mode
	const [darkMode, setDarkMode] = useState(false)

	// Toggle dark mode function
	const toggleDarkMode = () => {
		setDarkMode(!darkMode)
		// Store preference in localStorage
		localStorage.setItem("darkMode", (!darkMode).toString())
	}

	// Check for dark mode preference in localStorage or system preference on app load
	useEffect(() => {
		// First check if user has a saved preference
		const savedDarkMode = localStorage.getItem("darkMode")

		if (savedDarkMode !== null) {
			// User has a saved preference, use that
			setDarkMode(savedDarkMode === "true")
		} else {
			// No saved preference, check system preference
			const prefersDarkMode = window.matchMedia(
				"(prefers-color-scheme: dark)"
			).matches
			setDarkMode(prefersDarkMode)

			// Save this preference to localStorage
			localStorage.setItem("darkMode", prefersDarkMode.toString())
		}

		// Add listener for system preference changes
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
		const handleChange = (e) => {
			// Only update if user hasn't set a preference
			if (localStorage.getItem("darkMode") === null) {
				setDarkMode(e.matches)
			}
		}

		// Add the callback to handle changes
		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener("change", handleChange)
		} else {
			// For older browsers
			mediaQuery.addListener(handleChange)
		}

		// Clean up
		return () => {
			if (mediaQuery.removeEventListener) {
				mediaQuery.removeEventListener("change", handleChange)
			} else {
				// For older browsers
				mediaQuery.removeListener(handleChange)
			}
		}
	}, [])

	// Apply dark mode to document when darkMode state changes
	useEffect(() => {
		if (darkMode) {
			document.documentElement.classList.add("dark")
			document.body.style.backgroundColor = "#111827"
		} else {
			document.documentElement.classList.remove("dark")
			document.body.style.backgroundColor = ""
		}
	}, [darkMode])

	return (
		<DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
			<div
				className={`App min-h-screen ${
					darkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
				}`}
			>
				<div className="container mx-auto px-4">
					<div className="flex justify-end py-4">
						<button
							onClick={toggleDarkMode}
							className="dark-mode-toggle p-2 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							aria-label={
								darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
							}
							title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
						>
							{darkMode ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6 text-yellow-300"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
										clipRule="evenodd"
									/>
								</svg>
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6 text-gray-700"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
								</svg>
							)}
						</button>
					</div>
					<CricScenarios darkMode={darkMode} />
				</div>
			</div>
		</DarkModeContext.Provider>
	)
}

export default App
