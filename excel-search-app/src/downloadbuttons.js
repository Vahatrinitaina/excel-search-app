import React from 'react';

const DownloadButtons = ({ handleDownloadExcel, handleDownloadPDF, handleDownloadWord, handleInvoiceTemplateUpload }) => (
  <div>
    <button className="Btn" onClick={handleDownloadExcel}>
      <div className="sign">
        <svg viewBox="0 0 512 512">
          <path d="M256 160v192c0 8.84-7.16 16-16 16s-16-7.16-16-16V160l-96 96c-6.25 6.25-16.38 6.25-22.63 0s-6.25-16.38 0-22.63l128-128c6.25-6.25 16.38-6.25 22.63 0l128 128c6.25 6.25 6.25 16.38 0 22.63s-16.38 6.25-22.63 0l-96-96zM448 352c-8.84 0-16 7.16-16 16v32c0 17.67-14.33 32-32 32H112c-17.67 0-32-14.33-32-32v-32c0-8.84-7.16-16-16-16s-16 7.16-16 16v32c0 35.35 28.65 64 64 64h288c35.35 0 64-28.65 64-64v-32c0-8.84-7.16-16-16-16z"></path>
        </svg>
      </div>
      <div className="text">Télécharger</div>
    </button>

    <label className="Btna">
      Sélectionner le modèle de facture
      <input
        type="file"
        accept=".xlsx"
        style={{ display: 'none' }}
        onChange={handleInvoiceTemplateUpload}
      />
    </label>

    {/*<button className="Btn" onClick={handleDownloadPDF}>
      Télécharger PDF
    </button>

    <button className="Btn" onClick={handleDownloadWord}>
      Télécharger Word
    </button>*/}
  </div>
);

export default DownloadButtons;
