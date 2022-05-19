import React from "react";

const qualifiedTeams = ["gt", "lsg"];
const eliminatedTeams = ["csk", "mi", "kkr", "srh", "pbks"];
const getPosition = (team, position) => {
  if (eliminatedTeams.includes(team)) {
    return <span className="eliminated">E</span>;
  }
  if (qualifiedTeams.includes(team)) {
    return <span className="qualified">Q</span>;
  }
  return <span>{position}</span>;
};

export const TableRow = ({ team, m, w, l, p, nr, nrr, position }) => {
  const formattedNRR = nrr > 0 ? `+${nrr}` : nrr;
  return (
    <div className="table-row">
      <div>{getPosition(team, position)}</div>
      <div>{team.toUpperCase()}</div>
      <div>{m}</div>
      <div>{w}</div>
      <div>{l}</div>
      <div>{p}</div>
      <div>{formattedNRR}</div>
    </div>
  );
};
