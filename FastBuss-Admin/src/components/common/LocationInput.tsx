import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { locationService } from '../../services/locationService';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: number;
  lon: number;
}

const LocationInput = ({ value, onChange, placeholder, className }: LocationInputProps) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const results = await locationService.searchLocations(inputValue);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    onChange(suggestion.display_name);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={inputRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 sm:py-2 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 focus:outline-none focus:bg-gray-700"
            >
              {suggestion.display_name}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  );
};

export default LocationInput; 