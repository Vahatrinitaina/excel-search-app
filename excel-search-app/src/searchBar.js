import React from 'react';

const SearchBar = ({ query, handleQueryChange }) => (
  <div>
    <input
      type="text"
      value={query}
      onChange={handleQueryChange}
      placeholder="Recherche textuelle ..."
    />
  </div>
);

export default SearchBar;
