import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Gọi API backend
    const response = await fetch('http://localhost:5143/api/Auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    // Luôn trả về status 200 cho frontend, để TanStack Query có thể handle
    // Frontend sẽ check data.success để biết login thành công hay thất bại
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}