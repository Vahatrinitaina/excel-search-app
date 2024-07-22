import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import FileUploader from './fileUploader';
import SearchBar from './searchBar';
import NumericFilter from './numericFilter';
import ColumnSelector from './columnSelector';
import SearchResults from './searchResult';
import DownloadButtons from './downloadbuttons';

function App() {
  // État pour stocker les données Excel après le chargement du fichier
  const [data, setData] = useState([]);
  // État pour stocker la requête de recherche entrée par l'utilisateur
  const [query, setQuery] = useState('');
  // État pour stocker les données filtrées en fonction de la recherche et des filtres
  const [filteredData, setFilteredData] = useState([]);
  // États pour stocker les valeurs min et max pour le filtrage numérique
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  // État pour stocker les colonnes incluses dans la recherche (true/false pour chaque colonne)
  const [includedColumns, setIncludedColumns] = useState({});
  // État pour stocker le modèle de facture chargé
  const [templateWorkbook, setTemplateWorkbook] = useState(null);

  // Fonction pour gérer le téléchargement du fichier Excel contenant les données
  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // Récupère le fichier sélectionné
    const reader = new FileReader(); // Crée une nouvelle instance de FileReader

    reader.onload = (e) => {
      const binaryStr = e.target.result; // Récupère le contenu du fichier en tant que chaîne binaire
      try {
        // Lit le fichier Excel en utilisant XLSX
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0]; // Récupère le nom de la première feuille
        const sheet = workbook.Sheets[sheetName]; // Récupère la feuille correspondante

        if (!sheet) {
          throw new Error('Aucune feuille de calcul trouvée');
        }

        // Convertit la feuille Excel en JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (jsonData.length === 0) {
          throw new Error('Votre fichier excel est vide');
        }

        const headers = jsonData[0]; // Les en-têtes sont la première ligne
        const data = jsonData.slice(1).map(row => {
          let rowData = {};
          headers.forEach((header, index) => {
            if (row[index] !== undefined && row[index] !== null && row[index] !== '') {
              rowData[header] = row[index];
            }
          });
          return rowData;
        });

        setData(data); // Met à jour les données avec celles extraites du fichier Excel
        setFilteredData(data); // Initialise les données filtrées avec toutes les données

        // Initialise l'état des colonnes incluses pour la recherche
        const columns = {};
        headers.forEach((header) => {
          columns[header] = true;
        });
        setIncludedColumns(columns);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    };

    reader.readAsBinaryString(file); // Lit le fichier en tant que chaîne binaire
  };

  // Fonction pour gérer le téléchargement du modèle de facture
  const handleTemplateUpload = (event) => {
    const file = event.target.files[0]; // Récupère le fichier sélectionné
    const reader = new FileReader(); // Crée une nouvelle instance de FileReader

    reader.onload = async (e) => {
      const arrayBuffer = e.target.result; // Récupère le contenu du fichier en tant que ArrayBuffer
      try {
        // Lit le fichier Excel en utilisant ExcelJS
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer); // Charge le contenu du fichier dans le workbook
        setTemplateWorkbook(workbook); // Met à jour le modèle de facture
      } catch (error) {
        console.error('Error reading template file:', error);
      }
    };

    reader.readAsArrayBuffer(file); // Lit le fichier en tant que ArrayBuffer
  };

  // Fonction pour gérer la recherche et le filtrage des données
  const handleSearch = () => {
    const filtered = data.filter(item => {
      return Object.keys(item).some((key) => {
        if (!includedColumns[key]) {
          return false;
        }

        const val = item[key];

        // Filtrage par valeur numérique si les limites min et/ou max sont définies
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

        // Recherche par mot-clé
        return String(val).toLowerCase().includes(query.toLowerCase());
      });
    });
    setFilteredData(filtered); // Met à jour les données filtrées avec les résultats de la recherche
  };

  // Fonction pour gérer la modification de la requête de recherche
  const handleQueryChange = (event) => {
    setQuery(event.target.value); // Met à jour la requête de recherche avec la nouvelle valeur saisie
  };

  // Fonction pour gérer la sélection des colonnes à inclure dans la recherche
  const handleColumnChange = (event) => {
    const { name, checked } = event.target; // Récupère le nom et l'état de la colonne

    const checkedColumns = Object.values(includedColumns).filter(value => value).length;

    // Empêche la désélection de toutes les colonnes
    if (checkedColumns === 1 && !checked) {
      return;
    }

    setIncludedColumns(prevState => ({
      ...prevState,
      [name]: checked // Met à jour l'état de la colonne correspondante
    }));
  };

  // Fonction pour télécharger les données filtrées dans le modèle de facture
  const handleDownloadExcel = async () => {
    if (filteredData.length === 0 || !templateWorkbook) {
      alert('Aucune donnée à télécharger ou modèle de facture non chargé');
      return;
    }

    const worksheet = templateWorkbook.getWorksheet(1); // Récupère la première feuille du modèle

    if (filteredData.length > 0) {
      const firstItem = filteredData[0]; // Récupère le premier élément des données filtrées

      // Vérification et assignation des valeurs
      const nomDuProduit = firstItem['Nom du produit'] || ''; // ciblage par nom dans le champ à l'intérieure de notre fichier filtré
      const quantite = firstItem['Quantité'] || ''; 
      const prixUnitaire = firstItem['Prix unitaire HT'] || '';

      // debug de console pour s'assurer que les données ont été ajouté avec succès
      console.log('Nom du produit:', nomDuProduit); 
      console.log('Quantité:', quantite); 
      console.log('Prix unitaire:', prixUnitaire); 

      // Assignation des valeurs aux cellules
      worksheet.getCell('A17').value = nomDuProduit;
      worksheet.getCell('B17').value = quantite;
      worksheet.getCell('C17').value = prixUnitaire;
      
    }

    const buffer = await templateWorkbook.xlsx.writeBuffer(); // Écrit le contenu du workbook en buffer
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Facture.xlsx'); // Sauvegarde le fichier Excel
  };

  // Utilisation de useEffect pour exécuter la recherche lorsqu'un des critères de filtrage change
  useEffect(() => {
    handleSearch();
  }, [query, minValue, maxValue, includedColumns]); // Déclenche la recherche lorsque ces états changent

  return (
    <div className="App">
      <FileUploader handleFileUpload={handleFileUpload} />
      <div>
        <input type="file" onChange={handleTemplateUpload} />
      </div>
      <SearchBar query={query} handleQueryChange={handleQueryChange} />
      <NumericFilter minValue={minValue} maxValue={maxValue} setMinValue={setMinValue} setMaxValue={setMaxValue} />
      <ColumnSelector includedColumns={includedColumns} handleColumnChange={handleColumnChange} />
      <SearchResults filteredData={filteredData} includedColumns={includedColumns} />
      <DownloadButtons handleDownloadExcel={handleDownloadExcel} />
    </div>
  );
}

export default App;
