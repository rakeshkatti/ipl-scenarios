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

function App() {
	const [table, setTable] = useState(tabularData);
	const [matches, setMatches] = useState(matchData);
	const [currentScenario, setScenario] = useState({
		title: "Select an outcome",
	});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedTeam, setSelectedTeam] = useState(null);
	const [selectedPosition, setSelectedPosition] = useState(null);

	const resetAll = () => {
		setSelectedPosition(null);
		setSelectedTeam(null);
		setScenario({ title: "Select an outcome" });
		setTable(tabularData);
		setMatches(matchData);
	};

	let initialTable = useRef(table);
	let initialMatchData = useRef(matches);

	const tableComplete = () => {
		let count = 0;
		Object.keys(table).forEach((t) => {
			if (table[t]["m"] === 14) count++;
		});
		return count > 7;
	};

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
		// setSelectedTeam(null);
		// setSelectedPosition(null);
		setMatches({
			...matches,
			[match]: {
				...selectedMatch,
				win: winner,
			},
		});

		// if (tableComplete()) {
		// 	const feedbackSubmitted = sessionStorage.getItem("feedbackSubmitted");
		// 	if (!feedbackSubmitted) {
		// 		setTimeout(() => showModal(), 4000);
		// 	}
		// }
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
				<div className="game-container">
					{Object.keys(matches).map((match) => (
						<Game
							match={match}
							selectWinner={selectWinner}
							{...matches[match]}
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
