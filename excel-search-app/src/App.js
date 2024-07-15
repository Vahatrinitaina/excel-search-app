import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun } from 'docx';

import FileUploader from './fileUploader';
import SearchBar from './searchBar';
import NumericFilter from './numericFilter';
import ColumnSelector from './columnSelector';
import SearchResults from './searchResult';
import DownloadButtons from './downloadbuttons';

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
          throw new Error('Aucune feuille de calcul trouvée');
        }

        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (jsonData.length === 0) {
          throw new Error('Votre fichier excel est vide');
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

  const handleDownloadExcel = () => {
    if (filteredData.length === 0) {
      alert('Aucune données à télécharger');
      return;
    }

    const workbook = XLSX.utils.book_new();
    const sheetData = filteredData.map(row => Object.values(row));
    const worksheet = XLSX.utils.aoa_to_sheet([Object.keys(filteredData[0]), ...sheetData]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Data');
    XLSX.writeFile(workbook, 'Facture.xlsx');
  };

  const handleDownloadPDF = () => {
    if (filteredData.length === 0) {
      alert('Aucune données à télécharger');
      return;
    }

    const input = document.getElementById('invoice');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save('Facture.pdf');
    });
  };

  const handleDownloadWord = async () => {
    if (filteredData.length === 0) {
      alert('Aucune données à télécharger');
      return;
    }

    const doc = new Document();
    const tableRows = filteredData.map(row => {
      return Object.values(row).map(cell => new Paragraph(cell.toString()));
    });

    doc.addSection({
      children: [
        new Paragraph({
          children: [new TextRun("Facture")]
        }),
        ...tableRows
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Facture.docx';
    link.click();
  };

  useEffect(() => {
    handleSearch();
  }, [query, minValue, maxValue, includedColumns]);

  return (
    <div className="App">
      <FileUploader handleFileUpload={handleFileUpload} />
      <SearchBar query={query} handleQueryChange={handleQueryChange} />
      <NumericFilter minValue={minValue} maxValue={maxValue} setMinValue={setMinValue} setMaxValue={setMaxValue} />
      <ColumnSelector includedColumns={includedColumns} handleColumnChange={handleColumnChange} />
      <SearchResults filteredData={filteredData} includedColumns={includedColumns} handleColumnChange={handleColumnChange} />
      <DownloadButtons handleDownloadExcel={handleDownloadExcel} handleDownloadPDF={handleDownloadPDF} handleDownloadWord={handleDownloadWord} />
    </div>
  );
}

export default App;
