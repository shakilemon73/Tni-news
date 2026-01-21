import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  description: string;
}

interface Division {
  name: string;
  nameBn: string;
  lat: number;
  lon: number;
}

const divisions: Division[] = [
  { name: 'Dhaka', nameBn: 'ঢাকা', lat: 23.8103, lon: 90.4125 },
  { name: 'Chittagong', nameBn: 'চট্টগ্রাম', lat: 22.3569, lon: 91.7832 },
  { name: 'Rajshahi', nameBn: 'রাজশাহী', lat: 24.3745, lon: 88.6042 },
  { name: 'Khulna', nameBn: 'খুলনা', lat: 22.8456, lon: 89.5403 },
  { name: 'Sylhet', nameBn: 'সিলেট', lat: 24.8949, lon: 91.8687 },
  { name: 'Barishal', nameBn: 'বরিশাল', lat: 22.7010, lon: 90.3535 },
  { name: 'Rangpur', nameBn: 'রংপুর', lat: 25.7439, lon: 89.2752 },
  { name: 'Mymensingh', nameBn: 'ময়মনসিংহ', lat: 24.7471, lon: 90.4203 },
];

const WeatherWidget = () => {
  const [selectedDivision, setSelectedDivision] = useState<Division>(divisions[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (division: Division) => {
    setLoading(true);
    setError(null);
    
    try {
      // Using Open-Meteo API (free, no API key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${division.lat}&longitude=${division.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FDhaka`
      );
      
      if (!response.ok) {
        throw new Error('Weather data fetch failed');
      }
      
      const data = await response.json();
      
      const weatherCode = data.current.weather_code;
      let condition = 'sunny';
      let description = 'পরিষ্কার আকাশ';
      
      // Map WMO weather codes to conditions
      if (weatherCode === 0) {
        condition = 'sunny';
        description = 'পরিষ্কার আকাশ';
      } else if (weatherCode >= 1 && weatherCode <= 3) {
        condition = 'cloudy';
        description = 'আংশিক মেঘলা';
      } else if (weatherCode >= 45 && weatherCode <= 48) {
        condition = 'foggy';
        description = 'কুয়াশা';
      } else if (weatherCode >= 51 && weatherCode <= 67) {
        condition = 'rainy';
        description = 'বৃষ্টি';
      } else if (weatherCode >= 71 && weatherCode <= 77) {
        condition = 'snowy';
        description = 'তুষারপাত';
      } else if (weatherCode >= 80 && weatherCode <= 82) {
        condition = 'rainy';
        description = 'বৃষ্টি';
      } else if (weatherCode >= 95 && weatherCode <= 99) {
        condition = 'stormy';
        description = 'ঝড়';
      }
      
      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        condition,
        humidity: data.current.relative_humidity_2m,
        description
      });
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('আবহাওয়া তথ্য পাওয়া যায়নি');
      // Fallback data
      setWeather({
        temperature: 28,
        condition: 'sunny',
        humidity: 70,
        description: 'পরিষ্কার আকাশ'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedDivision);
    
    // Refresh weather every 30 minutes
    const interval = setInterval(() => {
      fetchWeather(selectedDivision);
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [selectedDivision]);

  const handleDivisionChange = (division: Division) => {
    setSelectedDivision(division);
  };

  const getWeatherIcon = () => {
    if (!weather) return <Sun size={16} className="text-white" />;
    
    switch(weather.condition) {
      case 'sunny':
        return <Sun size={16} className="text-yellow-300" />;
      case 'cloudy':
      case 'foggy':
        return <Cloud size={16} className="text-gray-300" />;
      case 'rainy':
        return <CloudRain size={16} className="text-blue-300" />;
      case 'snowy':
        return <CloudSnow size={16} className="text-blue-100" />;
      case 'stormy':
        return <CloudLightning size={16} className="text-yellow-400" />;
      default:
        return <Sun size={16} className="text-yellow-300" />;
    }
  };

  if (loading && !weather) {
    return (
      <div className="flex items-center gap-1 text-sm text-white">
        <Loader2 size={16} className="animate-spin" />
        <span>লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:text-white hover:bg-news-800 flex items-center gap-1 h-auto py-1 px-2"
        >
          {getWeatherIcon()}
          <span className="text-white">{selectedDivision.nameBn}: {weather?.temperature || '--'}°C</span>
          <ChevronDown size={12} className="text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white min-w-[180px]">
        <div className="px-2 py-1.5 text-xs text-muted-foreground border-b">
          বিভাগ নির্বাচন করুন
        </div>
        {divisions.map((division) => (
          <DropdownMenuItem 
            key={division.name}
            onClick={() => handleDivisionChange(division)}
            className={`cursor-pointer ${selectedDivision.name === division.name ? 'bg-accent' : ''}`}
          >
            {division.nameBn}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WeatherWidget;
