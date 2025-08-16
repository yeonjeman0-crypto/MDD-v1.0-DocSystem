import React, { useState, useCallback } from 'react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = React.memo(({ 
  onSearch, 
  placeholder = "문서 검색..." 
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
  }, [onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleSearch(value);
  };

  const handleClear = () => {
    handleSearch('');
  };

  return (
    <div className="search-box">
      <div className="search-input-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="search-input"
        />
        {query && (
          <button 
            onClick={handleClear}
            className="search-clear"
            aria-label="검색어 지우기"
          >
            ✕
          </button>
        )}
      </div>
      {query && (
        <div className="search-summary">
          <span className="search-query">"{query}" 검색 중</span>
        </div>
      )}
    </div>
  );
});