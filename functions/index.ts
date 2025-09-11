import { config } from "@/config/index.ts";

export const getWeather = async (args: { location: string; unit?: string }) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${args.location}&appid=${config.openWeatherMap.apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Extract the temperature in Kelvin
        const kelvinTemp = data.main.temp;
        // Convert Kelvin to Celsius
        const celsiusTemp = kelvinTemp - 273.15;

        const weatherData = {
            location: args.location,
            temperature: Math.round(celsiusTemp * 100) / 100,
            unit: args.unit || 'celsius',
            condition: data.weather[0].description,
            humidity: data.main.humidity
        };

        return {
            success: true,
            data: weatherData
        };
    } catch (error) {
        return {
            success: false,
            error: 'Failed to fetch weather data'
        };
    }
}

export const getLocation = async (args: { query: string }) => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(args.query)}&limit=1`);
        const data = await response.json();
        
        if (!data || data.length === 0) {
            return {
                success: false,
                error: 'Location not found'
            };
        }
        
        const location = data[0];
        const locationData = {
            query: args.query,
            coordinates: {
                lat: parseFloat(location.lat),
                lng: parseFloat(location.lon)
            },
            country: location.display_name.split(',').pop()?.trim() || 'Unknown',
            timezone: 'UTC',
            fullAddress: location.display_name
        };

        return {
            success: true,
            data: locationData
        };
    } catch (error) {
        return {
            success: false,
            error: 'Failed to fetch location data'
        };
    }
}
