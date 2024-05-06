import React from "react";
import { Select } from "antd";

export const Scenario = ({ updateScenario, scenarios, currentScenario }) => {
	const onChange = (value) => {
		updateScenario(value);
	};
	return (
		<div className="scenarios">
			<Select
				onChange={onChange}
				value={currentScenario.title}
				style={{ width: "100%" }} // Adjust the width as needed
			>
				{scenarios.map(({ title }) => (
					<Select.Option key={title} value={title}>
						{title.toUpperCase().split("-").join(" ")}
					</Select.Option>
				))}
			</Select>
		</div>
	);
};
