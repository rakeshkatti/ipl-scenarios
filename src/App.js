/* eslint-disable no-unused-vars */
import "antd/dist/antd.css";
import "./App.css";
import React, { useState, useRef, useMemo } from "react";
import { Game } from "./components/Game";
import { Scenario } from "./components/Scenario";
import { TableRow } from "./components/TableRow";
import { getUpdatedTable, getScenarios, filterPossibleOutcomes } from "./utils";
import { tabularData, matchData } from "./data";
import { Button, Form, Select } from "antd";
import { FormOutlined } from "@ant-design/icons";
import FeedbackModal from "./components/FeedbackModal";

function calculateNRR(runsScored, oversFaced, runsConceded, oversBowled) {
	if (oversFaced === 0 || oversBowled === 0) return 0; // Prevent division by zero
	const runRate = runsScored / oversFaced;
	const runRateConceded = runsConceded / oversBowled;
	return parseFloat((runRate - runRateConceded).toFixed(3));
}

function App() {
	const [table, setTable] = useState(tabularData);
	const [matches, setMatches] = useState(matchData);
	const [currentScenario, setScenario] = useState({
		title: "Select an outcome",
	});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedTeam, setSelectedTeam] = useState(null);
	const [selectedPosition, setSelectedPosition] = useState(null);

	const updateNRR = () => {
		const updatedTable = { ...table };
		Object.keys(initialTable.current).forEach((team) => {
			const teamData = { ...initialTable.current[team] };
			let { runs_scored, runs_conceded, overs_faced, overs_bowled } = teamData;
			Object.keys(matches).forEach((matchId) => {
				const mData = matches[matchId];
				runs_scored += mData.t1 === team ? mData.runsT1 : 0;
				runs_conceded += mData.t1 === team ? mData.runsT2 : 0;
				overs_faced += mData.t1 === team ? mData.oversT1 : 0;
				overs_bowled += mData.t1 === team ? mData.oversT2 : 0;
				runs_scored += mData.t2 === team ? mData.runsT2 : 0;
				runs_conceded += mData.t2 === team ? mData.runsT1 : 0;
				overs_faced += mData.t2 === team ? mData.oversT2 : 0;
				overs_bowled += mData.t2 === team ? mData.oversT1 : 0;
			});
			updatedTable[team].runs_scored = runs_scored;
			updatedTable[team].runs_conceded = runs_conceded;
			updatedTable[team].overs_faced = overs_faced;
			updatedTable[team].overs_bowled = overs_bowled;
			updatedTable[team].nrr = calculateNRR(
				runs_scored,
				overs_faced,
				runs_conceded,
				overs_bowled
			);
		});
		setTable(updatedTable);
	};

	const resetAll = () => {
		setSelectedPosition(null);
		setSelectedTeam(null);
		setScenario({ title: "Select an outcome" });
		setTable(tabularData);
		setMatches(matchData);
	};

	// Function to handle changes in runs or overs
	const handleRunsOversChange = (matchId, which, value) => {
		setMatches((prev) => ({
			...prev,
			[matchId]: {
				...prev[matchId],
				[which]: value,
			},
		}));
		updateNRR();
	};

	let initialTable = useRef(table);
	let initialMatchData = useRef(matches);

	// const tableComplete = () => {
	// 	let count = 0;
	// 	Object.keys(table).forEach((t) => {
	// 		if (table[t]["m"] === 14) count++;
	// 	});
	// 	return count > 7;
	// };
	// Update team statistics in table

	const selectWinner = (match, winner) => {
		const selectedMatch = matches[match];
		const team1 = selectedMatch.t1;
		const team2 = selectedMatch.t2;
		const winningTeam = winner;
		const losingTeam = winner === team1 ? team2 : team1;

		// Generate random runs for both teams
		const runsForWinningTeam = Math.floor(Math.random() * 101) + 150; // 150 to 250
		const runsForLosingTeam = Math.floor(Math.random() * 101) + 150; // 150 to 250

		const winningTeamRow = table[winningTeam];
		const losingTeamRow = table[losingTeam];

		// Ensure winning team has more runs
		const runsT1 =
			winningTeam === team1
				? Math.max(runsForWinningTeam, runsForLosingTeam + 1)
				: Math.min(runsForWinningTeam, runsForLosingTeam - 1);
		const runsT2 =
			winningTeam === team2
				? Math.max(runsForWinningTeam, runsForLosingTeam + 1)
				: Math.min(runsForWinningTeam, runsForLosingTeam - 1);

		if (selectedMatch.win === "") {
			setTable({
				...table,
				[winningTeam]: {
					...winningTeamRow,
					m: winningTeamRow.m + 1,
					w: winningTeamRow.w + 1,
					p: winningTeamRow.p + 2,
				},
				[losingTeam]: {
					...losingTeamRow,
					m: losingTeamRow.m + 1,
					l: losingTeamRow.l + 1,
				},
			});
		} else if (selectedMatch.win !== winner) {
			setTable({
				...table,
				[winningTeam]: {
					...winningTeamRow,
					w: winningTeamRow.w + 1,
					p: winningTeamRow.p + 2,
					l: winningTeamRow.l - 1,
				},
				[losingTeam]: {
					...losingTeamRow,
					l: losingTeamRow.l + 1,
					w: losingTeamRow.w - 1,
					p: losingTeamRow.p - 2,
				},
			});
		}
		setScenario({
			title: "Custom",
			matchData: initialMatchData.current,
		});
		// setSelectedTeam(null);
		// setSelectedPosition(null);
		setMatches({
			...matches,
			[match]: {
				...selectedMatch,
				win: winner,
				runsT1,
				runsT2,
				oversT1: 20, // Default overs
				oversT2: 20,
			},
		});

		// if (tableComplete()) {
		// 	const feedbackSubmitted = sessionStorage.getItem("feedbackSubmitted");
		// 	if (!feedbackSubmitted) {
		// 		setTimeout(() => showModal(), 4000);
		// 	}
		// }
		updateNRR();
	};

	const scenarios = useMemo(() => {
		return getScenarios(initialMatchData.current, initialTable.current);
	}, []);

	// setScenario(defaultScenario);
	const scenariosWithCustom =
		selectedTeam && selectedPosition
			? filterPossibleOutcomes(scenarios, selectedTeam, selectedPosition)
			: [];

	const updateScenario = (value) => {
		const selectedScenario = scenariosWithCustom.filter(
			(s) => s.title === value
		);
		if (selectedScenario.length > 0) {
			const matchData = selectedScenario[0].matchData;
			setMatches(matchData);
			setScenario(selectedScenario[0]);
			if (value === "Custom") {
				return setTable(initialTable.current);
			}
			const updatedTable = getUpdatedTable(matchData, initialTable.current);
			setTable(updatedTable);
		}
	};

	const sortedTable = Object.keys(table).sort((t1, t2) => {
		const a = table[t1];
		const b = table[t2];
		if (a.p === b.p) {
			return parseFloat(b.nrr) - parseFloat(a.nrr);
		}
		return b.p - a.p;
	});

	const isDesktop = window.innerWidth > 768;
	return (
		<>
			<h2 className="header">IPL 2024 Points Table Scenarios Calculator</h2>
			<div className="table-container">
				<div className="table-header">
					<div></div>
					<div></div>
					<div>Pld</div>
					<div>Won</div>
					<div>Lost</div>
					<div>NR</div>
					<div>PTS</div>
					<div>NRR</div>
				</div>
				{sortedTable.map((team, i) => (
					<TableRow position={i + 1} team={team} {...table[team]} />
				))}
			</div>
			<div className="sub-header">
				Possible outcomes at the current NRR.{" "}
				<Button onClick={resetAll} type="danger">
					RESET ALL
				</Button>
			</div>
			<div className="scenarios-section">
				<div className="scenario">
					Select Team:
					<Form.Item>
						<Select
							onChange={(value) => setSelectedTeam(value)}
							placeholder="Select a team"
							value={selectedTeam}
						>
							{Object.keys(table).map((t) => (
								<Select.Option key={t} value={t}>
									{t.toUpperCase()}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
				</div>
				<div className="scenario">
					Select Position:
					<Form.Item>
						<Select
							onChange={(value) => setSelectedPosition(value)}
							placeholder="Select a Position"
							value={selectedPosition}
						>
							<Select.Option key={1} value={1}></Select.Option>
							<Select.Option key={2} value={2}></Select.Option>
							<Select.Option key={3} value={3}></Select.Option>
							<Select.Option key={4} value={4}></Select.Option>
						</Select>
					</Form.Item>
				</div>
				<div className="scenario">
					{scenarios.length !== 0 ? (
						<>
							Possible outcomes -{" "}
							{selectedTeam && selectedPosition
								? scenariosWithCustom.length
								: scenarios.length}
							<Scenario
								updateScenario={updateScenario}
								scenarios={scenariosWithCustom}
								currentScenario={currentScenario}
							/>
						</>
					) : (
						<>No possible outcomes</>
					)}
				</div>
			</div>

			<div className="game-and-scenario">
				<div className="gamecontainer">
					{Object.keys(matches).map((matchId) => (
						<Game
							match={matchId}
							key={matchId}
							t1={matches[matchId].t1}
							t2={matches[matchId].t2}
							win={matches[matchId].win}
							runsT1={matches[matchId].runsT1}
							runsT2={matches[matchId].runsT2}
							oversT1={matches[matchId].oversT1}
							oversT2={matches[matchId].oversT2}
							handleRunsOversChange={(which, value) =>
								handleRunsOversChange(matchId, which, value)
							}
							selectWinner={(winner) => selectWinner(matchId, winner)}
						/>
					))}
				</div>
			</div>
			<Button
				type="primary"
				onClick={() => setIsModalOpen(true)}
				icon={<FormOutlined />}
				style={{
					position: "fixed",
					right: "20px",
					bottom: "20px",
					zIndex: 1000,
				}}
			>
				{isDesktop && "Give Feedback"}
			</Button>
			<FeedbackModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				table={table}
			/>
			<div className="footer">
				Made by a RCB fan with ❤️ and 😰 in 2022. Report any issues/feedback{" "}
				<a href="https://twitter.com/rakesh_katti">@rakesh_katti</a>
			</div>
		</>
	);
}

export default App;
