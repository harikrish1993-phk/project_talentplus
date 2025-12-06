// ============================================================================
// Single Client API - GET, PUT, DELETE
// Path: app/api/clients/[id]/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getClient, updateClient, deleteClient } from '@/lib/db/clients';
import { clientSchema } from '@/lib/validation/client-schema';
import { z } from 'zod';

// ============================================================================
// GET /api/clients/[id] - Get single client
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await getClient(params.id);
    
    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: client,
    });
    
  } catch (error: any) {
    console.error(`GET /api/clients/${params.id} error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch client',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/clients/[id] - Update client
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate input (partial update allowed)
    const validatedData = clientSchema.partial().parse(body);
    
    // Check if client exists
    const existingClient = await getClient(params.id);
    if (!existingClient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client not found',
        },
        { status: 404 }
      );
    }
    
    // Update client
    const updatedClient = await updateClient(params.id, validatedData);
    
    return NextResponse.json({
      success: true,
      data: updatedClient,
      message: 'Client updated successfully',
    });
    
  } catch (error: any) {
    console.error(`PUT /api/clients/${params.id} error:`, error);
    
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
        error: 'Failed to update client',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/clients/[id] - Delete client (soft delete)
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if client exists
    const existingClient = await getClient(params.id);
    if (!existingClient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client not found',
        },
        { status: 404 }
      );
    }
    
    // Soft delete (change status to inactive)
    await deleteClient(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    });
    
  } catch (error: any) {
    console.error(`DELETE /api/clients/${params.id} error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete client',
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
        'Allow': 'GET, PUT, DELETE, OPTIONS',
      },
    }
  );
}
