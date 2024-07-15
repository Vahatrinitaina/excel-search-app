import React from 'react';

const SearchResults = ({ filteredData, includedColumns, handleColumnChange }) => (
  <div>
    <h2>Résultats de la Recherche</h2>
    <table id="invoice">
      <thead>
        <tr>
          {filteredData.length > 0 &&
            Object.keys(filteredData[0]).map((key) => (
              <th key={key}>
                {key}
                <input
                  type="checkbox"
                  name={key}
                  checked={includedColumns[key]}
                  onChange={handleColumnChange}
                  style={{ marginLeft: '5px' }}
                />
              </th>
            ))
          }
        </tr>
      </thead>
      <tbody>
        {filteredData.map((row, index) => (
          <tr key={index}>
            {Object.entries(row).map(([key, value]) => (
              <td key={key}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SearchResults;
