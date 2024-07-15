import React from 'react';

const NumericFilter = ({ minValue, maxValue, setMinValue, setMaxValue }) => (
  <div className='group'>
    <h5 className='intit'>Recherche en valeur numérique</h5>
    <label>Entrez la valeur minimale ici</label>
    <input type="number" className='inp' value={minValue} onChange={(e) => setMinValue(e.target.value)} />

    <label>Entrez la valeur maximale ici</label>
    <input type="number" className='inp' value={maxValue} onChange={(e) => setMaxValue(e.target.value)} />
  </div>
);

export default NumericFilter;
