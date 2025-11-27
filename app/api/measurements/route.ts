import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { BodyMeasurement } from '@/lib/types';

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user;
}

// GET all measurements
export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const db = getDb();
    
    let measurements: BodyMeasurement[];
    
    if (startDate && endDate) {
      measurements = db.prepare(
        'SELECT * FROM body_measurements WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC'
      ).all(userId, startDate, endDate) as BodyMeasurement[];
    } else {
      measurements = db.prepare(
        'SELECT * FROM body_measurements WHERE user_id = ? ORDER BY date DESC LIMIT 100'
      ).all(userId) as BodyMeasurement[];
    }
    
    return NextResponse.json(measurements);
  } catch (error) {
    console.error('Error fetching measurements:', error);
    return NextResponse.json({ error: 'Failed to fetch measurements' }, { status: 500 });
  }
}

// POST create new measurement
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const body = await request.json();
    const { date, weight, body_fat_percentage, chest, waist, hips, bicep_left, bicep_right, thigh_left, thigh_right, notes } = body;
    
    const db = getDb();
    
    const insertMeasurement = db.prepare(
      `INSERT INTO body_measurements 
       (user_id, date, weight, body_fat_percentage, chest, waist, hips, bicep_left, bicep_right, thigh_left, thigh_right, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = insertMeasurement.run(
      userId, date, weight, body_fat_percentage, chest, waist, hips, 
      bicep_left, bicep_right, thigh_left, thigh_right, notes
    );
    
    return NextResponse.json({ id: result.lastInsertRowid, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating measurement:', error);
    return NextResponse.json({ error: 'Failed to create measurement' }, { status: 500 });
  }
}

// DELETE measurement
export async function DELETE(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Measurement ID required' }, { status: 400 });
    }
    
    const db = getDb();
    
    const deleteMeasurement = db.prepare('DELETE FROM body_measurements WHERE id = ? AND user_id = ?');
    deleteMeasurement.run(id, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting measurement:', error);
    return NextResponse.json({ error: 'Failed to delete measurement' }, { status: 500 });
  }
}
