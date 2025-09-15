import { config } from "@/config/index.ts";

export const getWeather = async (location: string, unit?: string ) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${config.openWeatherMap.apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Extract the temperature in Kelvin
        const kelvinTemp = data.main.temp;
        // Convert Kelvin to Celsius
        const celsiusTemp = kelvinTemp - 273.15;

        const weatherData = {
            location: location,
            temperature: Math.round(celsiusTemp * 100) / 100,
            unit: unit || 'celsius',
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
};
