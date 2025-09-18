import { config } from "@/config/index.ts";
import { TemperatureUnit } from "@/types/index.ts";

export const getWeather = async (location: string, unit?: TemperatureUnit | string) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${config.openWeatherMap.apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Extract the temperature in Kelvin
        const kelvinTemp = data.main.temp;

        // Calculate temperature based on requested unit
        let temperature: number;
        let finalUnit: string;

        if (unit === TemperatureUnit.FAHRENHEIT) {
            const celsiusTemp = kelvinTemp - 273.15;
            const fahrenheitTemp = (celsiusTemp * 9/5) + 32;
            temperature = Math.round(fahrenheitTemp * 100) / 100;
            finalUnit = TemperatureUnit.FAHRENHEIT;
        } else if (unit === TemperatureUnit.KELVIN) {
            temperature = Math.round(kelvinTemp * 100) / 100;
            finalUnit = TemperatureUnit.KELVIN;
        } else {
            // Default to celsius
            const celsiusTemp = kelvinTemp - 273.15;
            temperature = Math.round(celsiusTemp * 100) / 100;
            finalUnit = TemperatureUnit.CELSIUS;
        }

        const weatherData = {
            location: location,
            temperature: temperature,
            unit: finalUnit,
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
