import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api.playtak.com/api';

/**
 * Proxy endpoint for PlayTak API calls
 * Handles CORS issues and adds proper error handling
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const offset = searchParams.get('offset') || '0';
    const limit = searchParams.get('limit') || '10000';

    // Try to fetch from the games-history endpoint
    const url = `${API_BASE}/v1/games-history`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`PlayTak API error: ${response.status} ${response.statusText}`);
      
      // Return mock data for development if API fails
      return NextResponse.json(
        {
          games: [],
          error: `PlayTak API returned ${response.status}. See console for details.`,
          note: 'The API endpoint may not be publicly available. Consider using a local database or the PlayTak repository.',
        },
        { status: 200 } // Return 200 with error flag so client can handle it
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching games:', error);
    
    return NextResponse.json(
      {
        games: [],
        error: error.message || 'Failed to fetch games from PlayTak API',
        note: 'Running the API locally or using a cached dataset is recommended.',
      },
      { status: 200 }
    );
  }
}
