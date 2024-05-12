import React from "react";
import { Button, InputNumber } from "antd";

export const Game = ({
	t1,
	t2,
	win,
	match,
	runsT1,
	runsT2,
	oversT1,
	oversT2,
	handleRunsOversChange,
	selectWinner,
}) => {
	const handleSelectWinner = (team) => {
		selectWinner(team);
	};

	return (
		<div className="game-container">
			<div className="match-number">Match {match}</div>
			<div className="game-team">
				<Button
					className="game-action"
					type={win === t1 ? "primary" : "default"}
					onClick={() => handleSelectWinner(t1)}
				>
					{t1.toUpperCase()}
				</Button>
				{win && (
					<>
						<div className="game-inputs">
							<div>
								<label>Runs: </label>
								<InputNumber
									className="game-input"
									min={0}
									max={400}
									value={runsT1}
									onChange={(value) => handleRunsOversChange("runsT1", value)}
								/>
							</div>
							<div>
								<label>Overs: </label>
								<InputNumber
									className="game-input"
									min={1}
									max={20}
									value={oversT1}
									onChange={(value) => handleRunsOversChange("oversT1", value)}
								/>
							</div>
						</div>
					</>
				)}
			</div>
			<div className="game-team">
				<Button
					className="game-action"
					type={win === t2 ? "primary" : "default"}
					onClick={() => handleSelectWinner(t2)}
				>
					{t2.toUpperCase()}
				</Button>
				{win && (
					<>
						<div className="game-inputs">
							<div>
								<label>Runs: </label>
								<InputNumber
									className="game-input"
									min={0}
									max={400}
									value={runsT2}
									onChange={(value) => handleRunsOversChange("runsT2", value)}
								/>
							</div>
							<div>
								<label>Overs: </label>
								<InputNumber
									className="game-input"
									min={1}
									max={20}
									value={oversT2}
									onChange={(value) => handleRunsOversChange("oversT2", value)}
								/>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
