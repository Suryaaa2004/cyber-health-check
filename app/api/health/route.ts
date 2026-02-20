import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL;
    
    if (!backendUrl) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Backend URL not configured. Set BACKEND_URL environment variable.',
          frontend: 'ok'
        },
        { status: 503 }
      );
    }

    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      timeout: 5000,
    }).catch(err => {
      throw new Error(`Cannot reach backend at ${backendUrl}: ${err.message}`);
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          status: 'error',
          message: `Backend returned ${response.status}`,
          frontend: 'ok',
          backend: 'unreachable'
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      frontend: 'ok',
      backend: 'ok',
      backendUrl: backendUrl
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Health check failed',
        frontend: 'ok'
      },
      { status: 503 }
    );
  }
}
