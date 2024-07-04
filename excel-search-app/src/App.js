import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function App() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [includedColumns, setIncludedColumns] = useState({});

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      try {
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        if (!sheet) {
          throw new Error('No sheet found');
        }

        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (jsonData.length === 0) {
          throw new Error('Sheet is empty');
        }

        const headers = jsonData[0];
        const data = jsonData.slice(1).map(row => {
          let rowData = {};
          headers.forEach((header, index) => {
            if (row[index] !== undefined && row[index] !== null && row[index] !== '') {
              rowData[header] = row[index];
            }
          });
          return rowData;
        });

        setData(data);
        setFilteredData(data);

        const columns = {};
        headers.forEach((header) => {
          columns[header] = true;
        });
        setIncludedColumns(columns);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSearch = () => {
    const filtered = data.filter(item => {
      return Object.keys(item).some((key) => {
        if (!includedColumns[key]) {
          return false;
        }

        const val = item[key];

        if (minValue !== '' || maxValue !== '') {
          const numericValue = parseFloat(
            typeof val === 'string' ? val.replace(/[^\d.-]/g, '') : val
          );

          if (!isNaN(numericValue)) {
            return (
              (!minValue || numericValue >= parseFloat(minValue)) &&
              (!maxValue || numericValue <= parseFloat(maxValue))
            );
          }
        }

        return String(val).toLowerCase().includes(query.toLowerCase());
      });
    });
    setFilteredData(filtered);
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleColumnChange = (event) => {
    const { name, checked } = event.target;

    const checkedColumns = Object.values(includedColumns).filter(value => value).length;

    if (checkedColumns === 1 && !checked) {
      return;
    }

    setIncludedColumns(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

  useEffect(() => {
    handleSearch();
  }, [query, minValue, maxValue, includedColumns]);

  return (
    <div className="App">
      <h1 className='Titre'>Recherche dans le Fichier Excel</h1>
      <input type="file" onChange={handleFileUpload} accept=".xls,.xlsx"/>
      <input
        type="text"
        value={query}
        onChange={handleQueryChange}
        placeholder="Recherche textuelle ..."
      />

      <div className='group'>
        <h5 className='intit'> Recherche en valeure numérique</h5>
        <label>Entrez la valeure minimale ici</label>
        <input type="number" className='inp' value={minValue} onChange={(e) => setMinValue(e.target.value)} />

        <label>Entrez la valeure maximale ici</label>
        <input type="number" className='inp' value={maxValue} onChange={(e) => setMaxValue(e.target.value)} />
      </div>

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

      <div>
        <h2>Résultats de la Recherche</h2>
        <table>
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
    </div>
  );
}

export default App;
