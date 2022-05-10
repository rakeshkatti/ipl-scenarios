import "antd/dist/antd.css";
import "./App.css";
import React, { useState, useEffect } from "react";
import { Game } from "./components/Game";

const TableRow = ({ team, m, w, l, p, nr, nrr }) => (
  <div className="table-row">
    <div>{team.toUpperCase()}</div>
    <div>{m}</div>
    <div>{w}</div>
    <div>{l}</div>
    <div>{nr}</div>
    <div>{p}</div>
    <div>{nrr}</div>
  </div>
);

function App() {
  const [table, setTable] = useState({});
  const [matches, setMatches] = useState({});

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/alexsanjoseph/ipl-scenario-builder/main/data/current_standings.json"
    )
      .then((resp) => resp.json())
      .then((data) => {
        setTable(data);
      });
  }, []);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/alexsanjoseph/ipl-scenario-builder/main/data/filtered_fixtures.json"
    )
      .then((resp) => resp.json())
      .then((data) => {
        setMatches(data);
      });
  }, []);

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
    setMatches({
      ...matches,
      [match]: {
        ...selectedMatch,
        win: winner,
      },
    });
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
      <h1 className="header">IPL Points Table Scenarios Calculator</h1>
      <div className="table-header">
        <div>Team</div>
        <div>PLD</div>
        <div>WON</div>
        <div>LOST</div>
        <div>N/R</div>
        <div>PTS</div>
        <div>NET RR</div>
      </div>
      {sortedTable.map((team) => (
        <TableRow team={team} {...table[team]} />
      ))}
      <h3 className="sub-header">
        Choose the winning team to see the table change accordingly.
      </h3>
      <div className="game-container">
        {Object.keys(matches).map((match) => (
          <Game match={match} selectWinner={selectWinner} {...matches[match]} />
        ))}
      </div>
      <div className="footer">
        Made by a RCB fan with ❤️ and 😰. Report any issues/feedback{" "}
        <a href="https://twitter.com/rakesh_katti">@rakesh_katti</a>{" "}
      </div>
    </>
  );
}

export default App;
