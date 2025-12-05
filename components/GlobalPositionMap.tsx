import React, { useState, useMemo } from 'react';

// --- Types ---

interface CashPosition {
  currency: string;
  amount: number;
}

interface CountryPosition {
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  positions: CashPosition[];
  totalUSD: number;
}

interface MapData {
  countries: CountryPosition[];
  globalTotalUSD: number;
}

// --- Constants and Mock Data ---

// Simplified FX Rates (Foreign Currency per 1 USD, or inverse for EUR/GBP to approximate reality)
const FX_RATES: { [key: string]: number } = {
  USD: 1.0,
  EUR: 1.0 / 1.08, // 1 EUR = 1.08 USD -> 1 USD = 1/1.08 EUR
  GBP: 1.0 / 1.25,
  JPY: 1.0 / 0.0068,
  CAD: 1.0 / 0.73,
};

const mockData: CountryPosition[] = [
  {
    country: 'United States',
    countryCode: 'USA',
    latitude: 39.8283,
    longitude: -98.5795,
    positions: [
      { currency: 'USD', amount: 50000000 },
      { currency: 'CAD', amount: 2000000 },
    ],
    totalUSD: 0,
  },
  {
    country: 'Germany',
    countryCode: 'DEU',
    latitude: 51.1657,
    longitude: 10.4515,
    positions: [
      { currency: 'EUR', amount: 15000000 },
    ],
    totalUSD: 0,
  },
  {
    country: 'United Kingdom',
    countryCode: 'GBR',
    latitude: 55.3781,
    longitude: -3.4360,
    positions: [
      { currency: 'GBP', amount: 8000000 },
    ],
    totalUSD: 0,
  },
  {
    country: 'Japan',
    countryCode: 'JPN',
    latitude: 36.2048,
    longitude: 138.2529,
    positions: [
      { currency: 'JPY', amount: 750000000 },
    ],
    totalUSD: 0,
  },
  {
    country: 'Australia',
    countryCode: 'AUS',
    latitude: -25.2744,
    longitude: 133.7751,
    positions: [
      { currency: 'USD', amount: 12000000 },
    ],
    totalUSD: 0,
  },
];

// Map configuration constants
const MAP_WIDTH = 900;
const MAP_HEIGHT = 500;
const MAX_RADIUS = 30;
const MIN_RADIUS = 5;

// --- Utility Functions ---

const calculateMapData = (data: CountryPosition[]): MapData => {
  let globalTotalUSD = 0;
  const processedCountries = data.map(country => {
    let countryTotalUSD = 0;
    country.positions.forEach(p => {
      // Amount in USD equivalent = Local Amount / (FX Rate: USD/Local)
      const rate = FX_RATES[p.currency] || 1.0;
      countryTotalUSD += p.amount / rate;
    });
    globalTotalUSD += countryTotalUSD;
    return { ...country, totalUSD: countryTotalUSD };
  });

  return {
    countries: processedCountries,
    globalTotalUSD,
  };
};

const formatCurrency = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 1_000_000_000) {
    return sign + (absAmount / 1_000_000_000).toFixed(2) + 'B';
  }
  if (absAmount >= 1_000_000) {
    return sign + (absAmount / 1_000_000).toFixed(2) + 'M';
  }
  if (absAmount >= 1_000) {
    return sign + (absAmount / 1_000).toFixed(1) + 'K';
  }
  return sign + absAmount.toFixed(0);
};

const getColor = (amount: number): string => {
  return amount >= 0 ? 'text-green-600' : 'text-red-600';
};

/**
 * Highly simplified Mercator projection for placing coordinates on a 2D SVG map.
 * Assumes the SVG size matches MAP_WIDTH and MAP_HEIGHT.
 */
const mercatorProjection = (lng: number, lat: number) => {
  const x = (lng + 180) * (MAP_WIDTH / 360);
  
  // Convert latitude to radians
  const latRad = lat * (Math.PI / 180);
  
  // Calculate y using Mercator formula
  const y = (MAP_HEIGHT / 2) - (MAP_WIDTH * Math.log(Math.tan(Math.PI / 4 + latRad / 2)) / (2 * Math.PI));
  
  // Clamp y to map boundaries
  const clampedY = Math.min(Math.max(y, 0), MAP_HEIGHT);
  
  return { x, y: clampedY };
};

// --- Sub-components ---

const MapPoint: React.FC<{ position: CountryPosition, maxTotal: number }> = ({ position, maxTotal }) => {
  const { x, y } = mercatorProjection(position.longitude, position.latitude);
  
  // Scale radius based on total USD (normalized against the largest absolute position)
  const normalizedValue = Math.abs(position.totalUSD);
  const scale = maxTotal > 0 ? normalizedValue / maxTotal : 0;
  const radius = Math.max(MIN_RADIUS, scale * MAX_RADIUS);

  const colorClass = position.totalUSD >= 0 ? 'fill-green-600' : 'fill-red-600';
  const strokeColor = position.totalUSD >= 0 ? 'stroke-green-800' : 'stroke-red-800';

  const [isHovered, setIsHovered] = useState(false);

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer"
    >
      <circle 
        r={radius} 
        className={`${colorClass} opacity-70 ${strokeColor}`} 
        strokeWidth="2"
      />
      
      {/* Tooltip (Using foreignObject for rich HTML content inside SVG) */}
      {isHovered && (
        <foreignObject x={radius + 5} y={-40} width={250} height={150}>
          <div className="bg-white shadow-xl p-3 rounded border border-gray-400 text-xs text-gray-800 w-max pointer-events-none">
            <h4 className="font-bold mb-1 text-base">{position.country}</h4>
            <p className="text-gray-500">Global Position (USD Eq.)</p>
            <p className={`font-extrabold text-lg ${getColor(position.totalUSD)}`}>
              {formatCurrency(position.totalUSD)}
            </p>
            <div className="mt-2 pt-1 border-t">
              <p className="font-medium text-gray-700 mb-0.5">Local Currency Breakdown:</p>
              {position.positions.map((p, i) => (
                <p key={i} className="text-gray-600">
                  {p.currency}: {new Intl.NumberFormat().format(p.amount)}
                </p>
              ))}
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
};

// --- Main Component ---

const GlobalPositionMap: React.FC = () => {
  const data = useMemo(() => calculateMapData(mockData), []);
  
  // Find the maximum absolute value for scaling the circles
  const maxTotal = useMemo(() => 
    Math.max(...data.countries.map(c => Math.abs(c.totalUSD)))
  , [data]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 font-sans">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Global Cash Position Map</h2>
      
      {/* Summary Box */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50">
        <div className="text-sm font-medium text-indigo-700">
          Total Consolidated Liquidity (USD Equivalent):
        </div>
        <div className={`text-4xl font-extrabold mt-1 sm:mt-0 ${getColor(data.globalTotalUSD)}`}>
          {formatCurrency(data.globalTotalUSD)} <span className="text-lg">USD Eq.</span>
        </div>
      </div>

      {/* Map Visualization Container */}
      <div className="relative overflow-hidden border border-gray-300 rounded-md">
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center text-gray-400 text-sm italic bg-gray-50">
           {/* Placeholder for actual map integration (e.g., Leaflet or Deck.gl) */}
           <div className="p-4 bg-white border border-dashed border-gray-300 rounded shadow-inner w-11/12 h-11/12 flex items-center justify-center">
             <span className="text-lg">
                Conceptual Visualization of Treasury Positions on a Global Map
             </span>
           </div>
        </div>
        
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto relative"
          style={{ height: `${MAP_HEIGHT}px` }}
        >
          {/* Plotting points (these will overlay the conceptual map background) */}
          {data.countries.map((country) => (
            <MapPoint 
              key={country.countryCode} 
              position={country} 
              maxTotal={maxTotal} 
            />
          ))}
        </svg>
      </div>

      {/* Legend and Details */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-3 text-gray-800 border-b pb-2">Country Liquidity Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.countries.sort((a, b) => b.totalUSD - a.totalUSD).map((country) => (
            <div key={country.countryCode} className="p-4 border border-gray-200 rounded-lg transition duration-200 hover:shadow-md">
              <h4 className="font-bold text-lg mb-1">{country.country}</h4>
              <p className="text-sm text-gray-500 mb-2">ISO: {country.countryCode}</p>
              
              <div className="border-t pt-2">
                <p className={`text-xl font-extrabold ${getColor(country.totalUSD)}`}>
                  {formatCurrency(country.totalUSD)} USD Eq.
                </p>
              </div>

              <ul className="text-xs mt-3 space-y-1">
                <li className="font-semibold text-gray-700">Detailed Positions:</li>
                {country.positions.map((p, i) => (
                  <li key={i} className="flex justify-between items-center text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
                    <span>{p.currency}:</span>
                    <span className="font-mono">{new Intl.NumberFormat('en-US').format(p.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalPositionMap;