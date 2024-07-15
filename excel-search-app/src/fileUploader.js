import React from 'react';

const FileUploader = ({ handleFileUpload }) => (
  <div>
    <h1 className='Titre'>Recherche dans le Fichier Excel</h1>
    <input type="file" onChange={handleFileUpload} accept=".xls,.xlsx" />
  </div>
);

export default FileUploader;
