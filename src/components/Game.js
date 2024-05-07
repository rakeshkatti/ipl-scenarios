import React, { useState } from "react";
import { Radio, InputNumber } from "antd";

export const Game = ({ t1, t2, win, match, selectWinner, note, updateNRR }) => {
	const onChange = (e) => {
		selectWinner(match, e.target.value);
		setNote("");
	};
	const [runs, setRuns] = useState(1);
	const [balls, setBalls] = useState(0);
	const [noteState, setNote] = useState(note);
	return (
		<div className="match">
			<div className="match-number">Match {match}</div>
			<Radio.Group
				onChange={onChange}
				value={win}
				optionType="button"
				buttonStyle="solid"
			>
				<Radio.Button value={t1}>{t1.toUpperCase()}</Radio.Button>
				<Radio.Button value={t2}>{t2.toUpperCase()}</Radio.Button>
			</Radio.Group>
			<InputNumber
				min={1}
				max={500}
				defaultValue={1}
				value={runs}
				onChange={(e) => {
					if (win) {
						setRuns(e);
						setBalls(0);
						updateNRR(match, runs, balls);
						setNote("");
					} else {
						setNote("Please select a winner");
					}
				}}
			/>
			<InputNumber
				min={0}
				max={120}
				defaultValue={0}
				value={balls}
				onChange={(e) => {
					if (win) {
						setRuns(1);
						setBalls(e);
						updateNRR(match, runs, balls);
						setNote("");
					} else {
						setNote("Please select a winner");
					}
				}}
			/>
			<div className="note">{noteState}</div>
		</div>
	);
};
