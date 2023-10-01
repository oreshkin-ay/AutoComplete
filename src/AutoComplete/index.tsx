import React, { useState, useEffect, ChangeEvent, KeyboardEvent, } from 'react';
import { useDebounce, useClickOutside } from '../hooks';
import './autoComplete.css';

const highlightMatch = (text: string, query: string): React.ReactNode => {
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? <strong key={index}>{part}</strong> : part
  );
};

interface Items {
  id: number,
  name: string
}

interface Props<T> {
  onRequest: (searchRequest: string) => Promise<T[] | undefined>
}

const AutoComplete = <T extends Items>({ onRequest }: Props<T>) => {
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<null | T[]>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [isShow, setIsShow] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => {
    setIsShow(false)
    setSuggestions(null)
    setSelectedSuggestion(null)
  })

  const debouncedSearchTerm = useDebounce(query, 300);

  useEffect(() => {
    const fetchSuggestions = async (searchQuery: string) => {
      try {
        setLoading(true);

        const data = await onRequest(searchQuery);
        if (data) setSuggestions(data);
        setError(null);
      } catch (error: any) {
        setSuggestions(null);
        setError(error?.message ?? 'An error occurred while fetching suggestions.');
      } finally {
        setLoading(false);
      }
    }

    if (isShow && debouncedSearchTerm.trim() !== '') {
      fetchSuggestions(debouncedSearchTerm);
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm, onRequest, isShow]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setSelectedSuggestion(null);
    setSuggestions(null)
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSelectedSuggestion(null);
    setIsShow(false)
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions) {
      if (event.key === 'Enter' && selectedSuggestion !== null) {
        handleSuggestionClick(suggestions[selectedSuggestion]?.name);
      } else if (event.key === 'ArrowUp') {
        setSelectedSuggestion((prev) => Math.max((prev ?? suggestions.length) - 1, 0));
      } else if (event.key === 'ArrowDown') {
        setSelectedSuggestion((prev) => Math.min((prev ?? -1) + 1, suggestions.length - 1));
      }
    }
  };

  return (
    <div className='search' ref={ref}>
      <input
        className='input'
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (isShow) return;
          setIsShow(true)
          setSuggestions(null)
        }}
        placeholder="Type to search..."
      />
      {loading && (
        <p className='loading'>Loading...</p>
      )}
      {error && <p className='error'>{error}</p>}

      {(!loading && !!suggestions && isShow && !!query.trim().length) &&
        <div className='list-wrapper'>
          <ul className='list'>
            {suggestions.length ? suggestions.map(({ id, name }, index) => (
              <li
                key={id}
                onClick={() => handleSuggestionClick(name)}
                onMouseEnter={() => setSelectedSuggestion(index)}
                className={index === selectedSuggestion ? 'selected list-item' : 'list-item'}
              >
                {highlightMatch(name, query)}
              </li>
            )) :
              <li>No options</li>
            }
          </ul>
        </div>
      }
    </div >
  );
};

export default AutoComplete;
