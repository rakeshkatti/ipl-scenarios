/* eslint-disable no-unused-vars */
import "antd/dist/antd.css";
import "./App.css";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Game } from "./components/Game";
import { Scenario } from "./components/Scenario";
import { TableRow } from "./components/TableRow";
import { getUpdatedTable, getScenarios } from "./utils";
import { tabularData, matchData } from "./data";

function App() {
	const [table, setTable] = useState(tabularData);
	const [matches, setMatches] = useState(matchData);
	const [currentScenario, setScenario] = useState({
		title: "Custom",
	});

	let initialTable = useRef(table);
	let initialMatchData = useRef(matches);
	// useEffect(() => {
	// 	fetch(
	// 		"https://raw.githubusercontent.com/alexsanjoseph/ipl-scenario-builder/main/data/current_standings.json",
	// 		{ cache: "no-store" }
	// 	)
	// 		.then((resp) => resp.json())
	// 		.then((data) => {
	// 			initialTable.current = data;
	// 			setTable(initialTable.current);
	// 		});
	// }, []);

	// useEffect(() => {
	// 	fetch(
	// 		"https://raw.githubusercontent.com/alexsanjoseph/ipl-scenario-builder/main/data/filtered_fixtures.json",
	// 		{ cache: "no-store" }
	// 	)
	// 		.then((resp) => resp.json())
	// 		.then((data) => {
	// 			initialMatchData.current = data;
	// 			setMatches(data);
	// 		});
	// }, []);

	const selectWinner = (match, winner) => {
		const selectedMatch = matches[match];
		const team1 = selectedMatch.t1;
		const team2 = selectedMatch.t2;
		const winningTeam = winner;
		const losingTeam = winner === team1 ? team2 : team1;
		const winningTeamRow = table[winningTeam];
		const losingTeamRow = table[losingTeam];
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
		setMatches({
			...matches,
			[match]: {
				...selectedMatch,
				win: winner,
			},
		});
	};

	const scenarios = useMemo(
		() => getScenarios(initialMatchData.current, initialTable.current),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[initialMatchData.current, initialTable.current]
	);
	const scenariosWithCustom = [
		...scenarios,
		{ title: "Custom", matchData: initialMatchData.current },
	];

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
			<div className="game-and-scenario">
				<div className="game-container">
					{Object.keys(matches).map((match) => (
						<Game
							match={match}
							selectWinner={selectWinner}
							{...matches[match]}
						/>
					))}
				</div>
				{/* <div className="scenarios">
					<h3 className="sub-header">Possible outcomes for the 4th team</h3>
					<Scenario
						updateScenario={updateScenario}
						scenarios={scenariosWithCustom}
						currentScenario={currentScenario}
					/>
				</div> */}
			</div>
			<div className="footer">
				Made by a RCB fan with ❤️ and 😰 in 2022. Report any issues/feedback{" "}
				<a href="https://twitter.com/rakesh_katti">@rakesh_katti</a>
			</div>
		</>
	);
}

export default App;
