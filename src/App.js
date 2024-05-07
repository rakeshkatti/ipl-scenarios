/* eslint-disable no-unused-vars */
import "antd/dist/antd.css";
import "./App.css";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Game } from "./components/Game";
import { Scenario } from "./components/Scenario";
import { TableRow } from "./components/TableRow";
import { getUpdatedTable, getScenarios, filterPossibleOutcomes } from "./utils";
import { tabularData, matchData } from "./data";
import { Modal, Button, Form, Input, Select, message } from "antd";
import supabase from "./supabaseClient";
import { FormOutlined } from "@ant-design/icons";

function App() {
	const [table, setTable] = useState(tabularData);
	const [matches, setMatches] = useState(matchData);
	const [currentScenario, setScenario] = useState({
		title: "Select an outcome",
	});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedTeam, setSelectedTeam] = useState(null);
	const [selectedPosition, setSelectedPosition] = useState(null);

	const showModal = () => {
		setIsModalOpen(true);
	};
	const handleOk = () => {
		setIsModalOpen(false);
	};
	const handleCancel = () => {
		setIsModalOpen(false);
	};

	const [form] = Form.useForm();

	const resetAll = () => {
		setSelectedPosition(null);
		setSelectedTeam(null);
		setScenario({ title: "Select an outcome" });
		setTable(tabularData);
		setMatches(matchData);
	};

	const handleSubmit = async () => {
		try {
			// Validate only the necessary fields
			await form.validateFields();
			const values = form.getFieldsValue();

			console.log("Received values of form: ", values);

			// Send the data to Supabase
			const { data, error } = await supabase.from("user_feedback").insert([
				{
					name: values.name, // Optional field, no validation
					email: values.email, // Required with validation
					team: values.team, // Required with validation
					feedback: values.feedback, // Optional field, no validation
				},
			]);

			if (error) {
				throw error;
			}

			message.success("Feedback submitted successfully!");

			// Reset form after successful submission
			form.resetFields();
			sessionStorage.setItem("feedbackSubmitted", "true");
			handleOk();
		} catch (error) {
			console.error("Submission Failed:", error.message);
			message.error("Failed to submit feedback");
		}
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
			<Modal
				title="Thank you for using IPL Scenarios"
				open={isModalOpen}
				onOk={handleSubmit}
				onCancel={() => {
					handleCancel();
					form.resetFields(); // Reset form when cancelling
				}}
				okText="Submit"
				cancelText="Cancel"
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="team"
						label="Your Favorite Team"
						rules={[{ required: true, message: "Please select your team!" }]}
					>
						<Select placeholder="Select a team">
							{Object.keys(table).map((t) => (
								<Select.Option key={t} value={t}>
									{t.toUpperCase()}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item requiredMark="optional" name="name" label="Name">
						<Input />
					</Form.Item>
					<Form.Item
						requiredMark="optional"
						name="email"
						label="Email (for updates on new apps)"
						rules={[
							{
								type: "email",
								message: "Please input a valid email!",
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						requiredMark="optional"
						name="feedback"
						label="Feedback or Suggestions for Next League"
					>
						<Input.TextArea />
					</Form.Item>
				</Form>
			</Modal>
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
				<div>
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
				<div>
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
				{scenarios.length !== 0 ? (
					<div className="scenarios">
						Possible outcomes -{" "}
						{selectedTeam && selectedPosition
							? scenariosWithCustom.length
							: scenarios.length}
						<Scenario
							updateScenario={updateScenario}
							scenarios={scenariosWithCustom}
							currentScenario={currentScenario}
						/>
					</div>
				) : (
					<div className="scenarios">No possible outcomes</div>
				)}
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
				onClick={showModal}
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
			<div className="footer">
				Made by a RCB fan with ❤️ and 😰 in 2022. Report any issues/feedback{" "}
				<a href="https://twitter.com/rakesh_katti">@rakesh_katti</a>
			</div>
		</>
	);
}

export default App;
