export const getLocation = async (query: string ) => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await response.json();
        
        if (!data || data.length === 0) {
            return {
                success: false,
                error: 'Location not found'
            };
        }
        
        const location = data[0];
        const locationData = {
            query: query,
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
};
