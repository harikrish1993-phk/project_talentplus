// lib/linkedin/scraper.ts
import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'linkedin-data-api.p.rapidapi.com';

export async function searchLinkedInProfiles(
  keywords: string,
  location?: string
): Promise<any[]> {
  try {
    const response = await axios.get(
      `https://${RAPIDAPI_HOST}/search-people`,
      {
        params: {
          keywords,
          location: location || '',
          page: 1,
        },
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY!,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      }
     );
    
    return response.data.results || [];
  } catch (error) {
    console.error('LinkedIn search error:', error);
    return [];
  }
}

export async function getLinkedInProfile(profileUrl: string): Promise<any> {
  try {
    const response = await axios.get(
      `https://${RAPIDAPI_HOST}/get-profile`,
      {
        params: { url: profileUrl },
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY!,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      }
     );
    
    return response.data;
  } catch (error) {
    console.error('LinkedIn profile fetch error:', error);
    return null;
  }
}

export function convertLinkedInToCandidate(linkedInProfile: any): any {
  return {
    name: linkedInProfile.name,
    email: linkedInProfile.email || '',
    location: linkedInProfile.location,
    title: linkedInProfile.headline,
    summary: linkedInProfile.summary,
    skills: linkedInProfile.skills || [],
    experience: linkedInProfile.experience || [],
    education: linkedInProfile.education || [],
    linkedin_url: linkedInProfile.url,
    source: 'linkedin',
  };
}