import React, { useState, useEffect } from "react"
import {
	teamFullNames,
	teamColors,
	initialTeamData,
	initialMatchData,
	eliminatedTeams,
	qualifiedTeams,
} from "../data"

const CricScenarios = ({ darkMode }) => {
	// State for team data
	const [teamData, setTeamData] = useState(initialTeamData)
	// State for match results
	const [matchData, setMatchData] = useState(initialMatchData)
	// State for teams sorted by points and NRR
	const [standings, setStandings] = useState([])
	// State for simulation active
	const [simulationActive, setSimulationActive] = useState(false)
	// State for global edit mode
	const [editModeEnabled, setEditModeEnabled] = useState(false)

	// Toggle global edit mode
	const toggleEditMode = () => {
		setEditModeEnabled(!editModeEnabled)
	}

	// Calculate standings based on current team data
	const calculateStandings = (data) => {
		const teams = Object.keys(data).map((key) => ({
			id: key,
			name: teamFullNames[key],
			color: teamColors[key],
			...data[key],
		}))

		// Sort by points, then NRR
		teams.sort((a, b) => {
			if (a.p !== b.p) return b.p - a.p
			return b.nrr - a.nrr
		})

		return teams
	}

	// Reset all selections
	const resetSelections = () => {
		setMatchData(initialMatchData)
		setTeamData(initialTeamData)
		setSimulationActive(false)
	}

	// Set match winner
	const setMatchWinner = (matchId, winner) => {
		// Create a copy of the current match data
		const updatedMatches = { ...matchData }

		// Special case for "no result"
		if (winner === "nr") {
			if (updatedMatches[matchId].win === "nr") {
				// If already set to no result, toggle it off
				updatedMatches[matchId].win = ""
			} else {
				// Set to no result
				updatedMatches[matchId].win = "nr"
				// Clear runs and set to full 20 overs
				updatedMatches[matchId].runsT1 = 0
				updatedMatches[matchId].runsT2 = 0
				updatedMatches[matchId].oversT1 = 0
				updatedMatches[matchId].oversT2 = 0
			}
		} else {
			// Normal team winner

			// If the current winner is already set to this team, toggle it off
			if (updatedMatches[matchId].win === winner) {
				updatedMatches[matchId].win = ""
			} else {
				updatedMatches[matchId].win = winner

				// Auto-generate realistic scores if they haven't been set manually
				if (
					updatedMatches[matchId].runsT1 === 0 &&
					updatedMatches[matchId].runsT2 === 0
				) {
					const team1 = updatedMatches[matchId].t1
					const team2 = updatedMatches[matchId].t2

					// Base runs with some randomness
					const baseRuns = 160 + Math.floor(Math.random() * 40)

					// Adjust based on team NRR for more realistic scores
					const team1NrrFactor = initialTeamData[team1].nrr * 10
					const team2NrrFactor = initialTeamData[team2].nrr * 10

					if (winner === team1) {
						// Team 1 wins
						updatedMatches[matchId].runsT1 = Math.max(
							baseRuns + Math.round(team1NrrFactor),
							baseRuns - 20
						)
						updatedMatches[matchId].runsT2 = Math.max(
							baseRuns - 20 + Math.round(team2NrrFactor),
							100
						)

						// If batting second, adjust overs
						if (Math.random() > 0.5) {
							updatedMatches[matchId].oversT1 = 20
							updatedMatches[matchId].oversT2 = 20
						} else {
							updatedMatches[matchId].oversT1 = 20
							// Team 1 chased target in fewer overs
							const oversNeeded = Math.min(
								19.5,
								Math.max(15, 20 - Math.random() * 5)
							)
							updatedMatches[matchId].oversT2 = parseFloat(
								oversNeeded.toFixed(1)
							)
						}
					} else {
						// Team 2 wins
						updatedMatches[matchId].runsT2 = Math.max(
							baseRuns + Math.round(team2NrrFactor),
							baseRuns - 20
						)
						updatedMatches[matchId].runsT1 = Math.max(
							baseRuns - 20 + Math.round(team1NrrFactor),
							100
						)

						// If batting second, adjust overs
						if (Math.random() > 0.5) {
							updatedMatches[matchId].oversT1 = 20
							updatedMatches[matchId].oversT2 = 20
						} else {
							updatedMatches[matchId].oversT2 = 20
							// Team 2 chased target in fewer overs
							const oversNeeded = Math.min(
								19.5,
								Math.max(15, 20 - Math.random() * 5)
							)
							updatedMatches[matchId].oversT1 = parseFloat(
								oversNeeded.toFixed(1)
							)
						}
					}
				}
			}
		}

		// Update match data first
		setMatchData(updatedMatches)

		// Then update team data based on the new match results
		updateTeamData(updatedMatches)
	}

	// Update match score details
	const updateMatchScore = (matchId, field, value) => {
		const updatedMatches = { ...matchData }

		// Convert to number and validate
		const numValue = parseFloat(value)

		// Validate inputs
		if (isNaN(numValue)) return

		if (field === "runsT1" || field === "runsT2") {
			// Runs should be non-negative integers
			if (numValue < 0 || !Number.isInteger(numValue)) return
			updatedMatches[matchId][field] = numValue
		} else if (field === "oversT1" || field === "oversT2") {
			// Overs should be between 0 and 20, with valid decimal part (0 to 0.5)
			const wholePart = Math.floor(numValue)
			const decimalPart = numValue - wholePart

			if (wholePart < 0 || wholePart > 20 || decimalPart > 0.5) return
			updatedMatches[matchId][field] = numValue
		}

		// Update match data
		setMatchData(updatedMatches)

		// If a winner is selected, update the simulation
		if (updatedMatches[matchId].win) {
			updateTeamData(updatedMatches)
		}
	}

	// Update team data based on match results
	const updateTeamData = (matchesToProcess) => {
		// Create a copy of the initial team data
		const updatedTeamData = JSON.parse(JSON.stringify(initialTeamData))
		let matchesProcessed = false

		// Process all selected match winners
		Object.keys(matchesToProcess).forEach((matchId) => {
			const match = matchesToProcess[matchId]
			const winner = match.win

			if (winner && winner !== "" && match.t1 !== "tbd" && match.t2 !== "tbd") {
				matchesProcessed = true

				// Special case for no result (NR)
				if (winner === "nr") {
					// Both teams get 1 point, match played increases, NR count increases
					// No NRR impact for abandoned matches
					updatedTeamData[match.t1].m += 1
					updatedTeamData[match.t1].nr += 1
					updatedTeamData[match.t1].p += 1

					updatedTeamData[match.t2].m += 1
					updatedTeamData[match.t2].nr += 1
					updatedTeamData[match.t2].p += 1
				} else {
					// Normal match with a winner
					// Use actual match scores for NRR calculation
					const runsT1 = match.runsT1
					const runsT2 = match.runsT2
					const oversT1 = match.oversT1
					const oversT2 = match.oversT2

					// Convert overs to balls for accurate calculation
					const oversT1Balls =
						Math.floor(oversT1) * 6 + Math.round((oversT1 % 1) * 10)
					const oversT2Balls =
						Math.floor(oversT2) * 6 + Math.round((oversT2 % 1) * 10)

					if (winner === match.t1) {
						// Team 1 wins
						// Update Team 1 (winner) stats
						updatedTeamData[match.t1].m += 1
						updatedTeamData[match.t1].w += 1
						updatedTeamData[match.t1].p += 2
						updatedTeamData[match.t1].runs_scored += runsT1
						updatedTeamData[match.t1].runs_conceded += runsT2
						updatedTeamData[match.t1].overs_faced += oversT1
						updatedTeamData[match.t1].overs_bowled += oversT2

						// Update Team 2 (loser) stats
						updatedTeamData[match.t2].m += 1
						updatedTeamData[match.t2].l += 1
						updatedTeamData[match.t2].runs_scored += runsT2
						updatedTeamData[match.t2].runs_conceded += runsT1
						updatedTeamData[match.t2].overs_faced += oversT2
						updatedTeamData[match.t2].overs_bowled += oversT1
					} else {
						// Team 2 wins
						// Update Team 2 (winner) stats
						updatedTeamData[match.t2].m += 1
						updatedTeamData[match.t2].w += 1
						updatedTeamData[match.t2].p += 2
						updatedTeamData[match.t2].runs_scored += runsT2
						updatedTeamData[match.t2].runs_conceded += runsT1
						updatedTeamData[match.t2].overs_faced += oversT2
						updatedTeamData[match.t2].overs_bowled += oversT1

						// Update Team 1 (loser) stats
						updatedTeamData[match.t1].m += 1
						updatedTeamData[match.t1].l += 1
						updatedTeamData[match.t1].runs_scored += runsT1
						updatedTeamData[match.t1].runs_conceded += runsT2
						updatedTeamData[match.t1].overs_faced += oversT1
						updatedTeamData[match.t1].overs_bowled += oversT2
					}
				}
			}
		})

		// Recalculate NRR for all teams
		Object.keys(updatedTeamData).forEach((teamKey) => {
			const team = updatedTeamData[teamKey]

			// Calculate balls for overs
			const overs_faced_balls =
				Math.floor(team.overs_faced) * 6 +
				Math.round((team.overs_faced % 1) * 10)
			const overs_bowled_balls =
				Math.floor(team.overs_bowled) * 6 +
				Math.round((team.overs_bowled % 1) * 10)

			// Avoid division by zero
			const faced_balls = Math.max(1, overs_faced_balls)
			const bowled_balls = Math.max(1, overs_bowled_balls)

			team.nrr = parseFloat(
				(
					team.runs_scored / (faced_balls / 6) -
					team.runs_conceded / (bowled_balls / 6)
				).toFixed(3)
			)
		})

		if (matchesProcessed) {
			setTeamData(updatedTeamData)
			setSimulationActive(true)
		}
	}

	// Update standings whenever team data changes
	useEffect(() => {
		const newStandings = calculateStandings(teamData)
		setStandings(newStandings)
	}, [teamData])

	// Initialize on component mount
	useEffect(() => {
		const initialStandings = calculateStandings(teamData)
		setStandings(initialStandings)
	}, [])

	// Filter out playoff matches
	const remainingMatches = Object.entries(matchData).filter(
		([key, match]) =>
			parseInt(key) <= 70 && match.t1 !== "tbd" && match.t2 !== "tbd"
	)

	return (
		<div className="p-2 sm:p-4 max-w-6xl mx-auto">
			<div className="mb-8 text-center">
				<h1
					className={`text-3xl font-bold ${
						darkMode ? "text-blue-400" : "text-blue-800"
					}`}
				>
					Cricket Scenarios
				</h1>
				<p className={`mt-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
					Simulate cricket playoff scenarios by selecting match winners
				</p>
				<p
					className={`text-sm mt-1 ${
						darkMode ? "text-gray-400" : "text-gray-500"
					}`}
				>
					Standings update automatically as you select teams
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6">
				{/* Current Standings */}
				<div>
					<div
						className={`rounded-lg shadow p-4 ${
							darkMode ? "bg-gray-800" : "bg-white"
						}`}
					>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold">Current Standings</h2>
							<div>
								<button
									onClick={resetSelections}
									className={`py-1 px-2 rounded hover:bg-gray-300 ${
										darkMode
											? "bg-gray-700 text-gray-200 hover:bg-gray-600"
											: "bg-gray-200 text-gray-800"
									}`}
								>
									Reset All
								</button>
							</div>
						</div>
						<div className="overflow-x-auto">
							<table
								className={`min-w-full ${
									darkMode ? "bg-gray-800" : "bg-white"
								}`}
							>
								<thead>
									<tr className={darkMode ? "bg-gray-700" : "bg-blue-100"}>
										<th className="py-2 px-4 text-left">Pos</th>
										<th className="py-2 px-4 text-left">Team</th>
										<th className="py-2 px-4 text-center">M</th>
										<th className="py-2 px-4 text-center">W</th>
										<th className="py-2 px-4 text-center">L</th>
										<th className="py-2 px-4 text-center">NR</th>
										<th className="py-2 px-4 text-center">Pts</th>
										<th className="py-2 px-4 text-center">NRR</th>
									</tr>
								</thead>
								<tbody>
									{standings.map((team, index) => (
										<tr
											key={team.id}
											className={
												index < 4
													? darkMode
														? "bg-green-900 bg-opacity-30"
														: "bg-green-50"
													: darkMode
													? ""
													: ""
											}
											style={{ borderLeft: `4px solid ${team.color}` }}
										>
											<td className="py-2 px-4">{index + 1}</td>
											<td className="py-2 px-4 font-medium">
												{team.name}
												{eliminatedTeams.includes(team.id) && (
													<span className="ml-1 text-xs font-bold text-red-600">
														&nbsp;E
													</span>
												)}
												{qualifiedTeams.includes(team.id) && (
													<span className="ml-1 text-xs font-bold text-green-600">
														&nbsp;Q
													</span>
												)}
											</td>
											<td className="py-2 px-4 text-center">{team.m}</td>
											<td className="py-2 px-4 text-center">{team.w}</td>
											<td className="py-2 px-4 text-center">{team.l}</td>
											<td className="py-2 px-4 text-center">{team.nr}</td>
											<td className="py-2 px-4 text-center font-semibold">
												{team.p}
											</td>
											<td className="py-2 px-4 text-center">
												{team.nrr.toFixed(3)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div
							className={`mt-4 text-sm ${
								darkMode ? "text-gray-400" : "text-gray-500"
							}`}
						>
							<p>
								* Teams highlighted in green are currently in playoff positions
								(top 4)
							</p>
							<p>
								* In case of equal points, team with higher NRR gets the higher
								position
							</p>
							<p>
								* <span className="font-bold text-red-600">E</span>: Eliminated
								from playoff contention |{" "}
								<span className="font-bold text-green-600">Q</span>: Qualified
								for playoffs
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Remaining Fixtures */}
			<div className="mt-6">
				<div
					className={`rounded-lg shadow p-4 ${
						darkMode ? "bg-gray-800" : "bg-white"
					}`}
				>
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-semibold">Remaining Fixtures</h2>
						<button
							onClick={toggleEditMode}
							className={`px-2 py-1 rounded mr-2 ${
								editModeEnabled
									? darkMode
										? "bg-gray-700 text-gray-200"
										: "bg-gray-200 text-gray-800"
									: darkMode
									? "bg-blue-600 text-white"
									: "bg-blue-600 text-white"
							}`}
						>
							{editModeEnabled ? "Hide NRR Impact" : "Show NRR Impact"}
						</button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{remainingMatches.map(([matchId, match]) => {
							const team1 = teamFullNames[match.t1]
							const team2 = teamFullNames[match.t2]
							const team1Color = teamColors[match.t1]
							const team2Color = teamColors[match.t2]

							return (
								<div
									key={matchId}
									className={`border rounded-lg p-3 ${
										darkMode ? "border-gray-700 bg-gray-800" : ""
									}`}
									style={{
										background: darkMode
											? "linear-gradient(135deg, rgba(31,41,55,1) 0%, rgba(17,24,39,1) 100%)"
											: "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 100%)",
									}}
								>
									<div
										className={`text-sm mb-2 ${
											darkMode ? "text-gray-400" : "text-gray-500"
										}`}
									>
										<span>Match {matchId}</span>
									</div>

									<div className="flex justify-between items-center mb-1">
										<button
											onClick={() => setMatchWinner(matchId, match.t1)}
											className={`px-2 py-1 rounded text-sm flex-1 mr-1 ${
												match.win === match.t1
													? "text-white"
													: darkMode
													? "bg-gray-700 hover:bg-blue-900"
													: "bg-white hover:bg-blue-100"
											}`}
											style={{
												backgroundColor:
													match.win === match.t1
														? team1Color
														: darkMode
														? "#374151"
														: "white",
												borderLeft: `3px solid ${team1Color}`,
											}}
										>
											{team1}
										</button>
										<span
											className={`text-xs mx-1 ${
												darkMode ? "text-gray-400" : ""
											}`}
										>
											vs
										</span>
										<button
											onClick={() => setMatchWinner(matchId, match.t2)}
											className={`px-2 py-1 rounded text-sm flex-1 ml-1 ${
												match.win === match.t2
													? "text-white"
													: darkMode
													? "bg-gray-700 hover:bg-blue-900"
													: "bg-white hover:bg-blue-100"
											}`}
											style={{
												backgroundColor:
													match.win === match.t2
														? team2Color
														: darkMode
														? "#374151"
														: "white",
												borderRight: `3px solid ${team2Color}`,
											}}
										>
											{team2}
										</button>
									</div>

									<div className="flex justify-center mt-1 mb-1">
										<button
											onClick={() => setMatchWinner(matchId, "nr")}
											className={`px-2 py-1 rounded text-xs ${
												match.win === "nr"
													? "bg-yellow-500 text-white"
													: darkMode
													? "bg-gray-700 hover:bg-yellow-900"
													: "bg-gray-100 hover:bg-yellow-100"
											}`}
										>
											No Result
										</button>
									</div>

									{editModeEnabled && (
										<div
											className={`mt-3 border-t pt-2 ${
												darkMode ? "border-gray-700" : ""
											}`}
										>
											<div className="grid grid-cols-2 gap-2 mb-2">
												<div>
													<div
														className={`text-xs mb-1 ${
															darkMode ? "text-gray-400" : "text-gray-500"
														}`}
													>
														{team1} Score
													</div>
													<div className="flex">
														<input
															type="number"
															value={match.runsT1}
															onChange={(e) =>
																updateMatchScore(
																	matchId,
																	"runsT1",
																	e.target.value
																)
															}
															className={`w-16 p-1 text-sm border rounded ${
																darkMode
																	? "bg-gray-700 border-gray-600 text-white"
																	: "border-gray-300"
															}`}
															min="0"
															max="300"
														/>
														<span
															className={`mx-1 text-xs self-center ${
																darkMode ? "text-gray-400" : ""
															}`}
														>
															/
														</span>
														<input
															type="number"
															value={match.oversT1}
															onChange={(e) =>
																updateMatchScore(
																	matchId,
																	"oversT1",
																	e.target.value
																)
															}
															className={`w-16 p-1 text-sm border rounded ${
																darkMode
																	? "bg-gray-700 border-gray-600 text-white"
																	: "border-gray-300"
															}`}
															min="0"
															max="20"
															step="0.1"
														/>
														<span
															className={`ml-1 text-xs self-center ${
																darkMode ? "text-gray-400" : ""
															}`}
														>
															overs
														</span>
													</div>
												</div>
												<div>
													<div
														className={`text-xs mb-1 ${
															darkMode ? "text-gray-400" : "text-gray-500"
														}`}
													>
														{team2} Score
													</div>
													<div className="flex">
														<input
															type="number"
															value={match.runsT2}
															onChange={(e) =>
																updateMatchScore(
																	matchId,
																	"runsT2",
																	e.target.value
																)
															}
															className={`w-16 p-1 text-sm border rounded ${
																darkMode
																	? "bg-gray-700 border-gray-600 text-white"
																	: "border-gray-300"
															}`}
															min="0"
															max="300"
														/>
														<span
															className={`mx-1 text-xs self-center ${
																darkMode ? "text-gray-400" : ""
															}`}
														>
															/
														</span>
														<input
															type="number"
															value={match.oversT2}
															onChange={(e) =>
																updateMatchScore(
																	matchId,
																	"oversT2",
																	e.target.value
																)
															}
															className={`w-16 p-1 text-sm border rounded ${
																darkMode
																	? "bg-gray-700 border-gray-600 text-white"
																	: "border-gray-300"
															}`}
															min="0"
															max="20"
															step="0.1"
														/>
														<span
															className={`ml-1 text-xs self-center ${
																darkMode ? "text-gray-400" : ""
															}`}
														>
															overs
														</span>
													</div>
												</div>
											</div>
											{match.win && (
												<div
													className={`text-xs mt-1 ${
														darkMode ? "text-gray-400" : "text-gray-500"
													}`}
												>
													<p>
														NRR Impact: This match will affect Net Run Rate
														calculations
													</p>
												</div>
											)}
										</div>
									)}
								</div>
							)
						})}
					</div>
				</div>
			</div>

			<footer
				className={`mt-8 text-center text-sm ${
					darkMode ? "text-gray-400" : "text-gray-500"
				}`}
			>
				<p>
					Made by a RCB fan with ❤️ and 😰 since 2022. Report any
					issues/feedback at{" "}
					<a
						href="https://x.com/rakesh_katti"
						className={
							darkMode
								? "text-blue-400 hover:underline"
								: "text-blue-600 hover:underline"
						}
					>
						@rakesh_katti
					</a>
				</p>
			</footer>
		</div>
	)
}

export default CricScenarios
