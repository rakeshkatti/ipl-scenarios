import React from "react";
import { Radio } from "antd";

export const Scenario = ({ updateScenario, scenarios, currentScenario }) => {
  const onChange = (e) => {
    updateScenario(e.target.value);
  };
  return (
    <div className="scenarios">
      <Radio.Group
        onChange={onChange}
        value={currentScenario.title}
        optionType="button"
        buttonStyle="solid"
      >
        {scenarios.map(({ title }) => (
          <div className="scenario">
            <Radio.Button value={title}>
              {title.toUpperCase().split("-").join(" ")}
            </Radio.Button>
          </div>
        ))}
      </Radio.Group>
    </div>
  );
};
