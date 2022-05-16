import React from "react";
import { Radio } from "antd";

export const Game = ({ t1, t2, win, match, selectWinner }) => {
  const onChange = (e) => {
    selectWinner(match, e.target.value);
  };
  return (
    <div className="match">
      <div className="match-number">Match {match}</div>
      <Radio.Group onChange={onChange} optionType="button" buttonStyle="solid">
        <Radio.Button value={t1}>{t1.toUpperCase()}</Radio.Button>
        <Radio.Button value={t2}>{t2.toUpperCase()}</Radio.Button>
      </Radio.Group>
    </div>
  );
};
