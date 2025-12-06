// ============================================================================
// Clients API - GET (list) and POST (create)
// Path: app/api/clients/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getClients, createClient, searchClients } from '@/lib/db/clients';
import { clientSchema } from '@/lib/validation/client-schema';
import { z } from 'zod';

// ============================================================================
// GET /api/clients - List clients or search
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if this is a search request
    const query = searchParams.get('q') || searchParams.get('search');
    
    if (query) {
      // Search clients
      const results = await searchClients(query);
      return NextResponse.json({
        success: true,
        data: results,
        count: results.length,
      });
    }
    
    // Otherwise, list clients with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const result = await getClients(page, limit);
    
    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasMore: result.hasMore,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
    
  } catch (error: any) {
    console.error('GET /api/clients error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch clients',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/clients - Create new client
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = clientSchema.parse(body);
    
    // Get organization_id from auth context
    const organizationId = body.organization_id;
    
    if (!organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization ID is required',
        },
        { status: 400 }
      );
    }
    
    // Create client
    const client = await createClient({
      ...validatedData,
      organization_id: organizationId,
    });
    
    return NextResponse.json(
      {
        success: true,
        data: client,
        message: 'Client created successfully',
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('POST /api/clients error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create client',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS - CORS preflight
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'GET, POST, OPTIONS',
      },
    }
  );
}
