function SearchBar({ value, onChange }) {
  return (
    <div className="search-wrapper">
      <span className="search-icon">⌕</span>

      <input
        className="search-input"
        type="text"
        placeholder="Search your notes..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />

      {!value && (
        <span className="search-shortcut">
          Ctrl K
        </span>
      )}

      {value && (
        <button
          className="search-clear"
          onClick={() => onChange("")}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default SearchBar;