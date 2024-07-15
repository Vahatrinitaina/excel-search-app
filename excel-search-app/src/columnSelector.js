import React from 'react';

const ColumnSelector = ({ includedColumns, handleColumnChange }) => (
  <div>
    <h2>Colonnes à inclure dans la recherche</h2>
    {Object.keys(includedColumns).map((key) => (
      <label key={key}>
        <input
          type="checkbox"
          name={key}
          checked={includedColumns[key]}
          onChange={handleColumnChange}
        />
        {key}
      </label>
    ))}
  </div>
);

export default ColumnSelector;
