import React from 'react';

export default function MoveList({ moves = [] }) {
  // Format moves into pairs (1. e4 e5  2. Nf3 Nc6)
  const pairedMoves = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairedMoves.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1] || '',
    });
  }

  return (
    <div className="move-list-container">
      <h3>Move Log</h3>
      <div className="move-list-scroll">
        {pairedMoves.length === 0 ? (
          <p className="no-moves">No moves made yet.</p>
        ) : (
          <table className="move-table">
            <thead>
              <tr>
                <th>#</th>
                <th>White</th>
                <th>Black</th>
              </tr>
            </thead>
            <tbody>
              {pairedMoves.map((m) => (
                <tr key={m.number}>
                  <td className="move-num">{m.number}.</td>
                  <td className="move-white">{m.white}</td>
                  <td className="move-black">{m.black}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
