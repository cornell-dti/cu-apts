import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Define the structure of the API response based on the AdminPage usage
interface ApartmentData {
  buildingData: {
    id: string;
    name: string;
    address: string;
    area: string;
    numBeds: number;
    numBaths: number;
    landlordId: string;
    photos: string[];
    urlName: string;
    latitude: number;
    longitude: number;
    distanceToCampus: number;
  };
  numReviews: number;
  company: string;
  avgRating: number;
  avgPrice: number;
}

interface ApiResponse {
  buildingData: ApartmentData[];
  isEnded: boolean;
}

/**
 * Script to export apartment names to a CSV file
 *
 * This script fetches all apartment data from the API endpoint used in AdminPage
 * and exports just the apartment names to a CSV file.
 */
const exportApartmentNames = async () => {
  try {
    console.log('Fetching apartment data...');

    // Use the same API endpoint as AdminPage
    const response = await axios.get<ApiResponse>(
      'http://localhost:8080/api/page-data/home/1000/numReviews'
    );

    if (!response.data || !response.data.buildingData) {
      throw new Error('No apartment data received from API');
    }

    const apartments = response.data.buildingData;
    console.log(`Found ${apartments.length} apartments`);

    // Extract apartment names
    const apartmentNames = apartments.map((apt) => apt.buildingData.name);

    // Create CSV content
    const csvHeader = 'Apartment Name\n';
    const csvContent = apartmentNames.map((name) => `"${name}"`).join('\n');
    const fullCsvContent = csvHeader + csvContent;

    // Write to CSV file
    const outputPath = path.join(__dirname, 'apartment_names.csv');
    fs.writeFileSync(outputPath, fullCsvContent, 'utf8');

    console.log(`Successfully exported ${apartmentNames.length} apartment names to: ${outputPath}`);
    console.log('First few apartment names:');
    apartmentNames.slice(0, 5).forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
  } catch (error) {
    console.error('Error exporting apartment names:', error);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        console.error(
          'Could not connect to the server. Make sure the backend server is running on localhost:3000'
        );
      } else {
        console.error('API request failed:', error.message);
      }
    }

    process.exit(1);
  }
};

// Run the script
exportApartmentNames();
