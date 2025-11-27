import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Exercise } from '@/lib/types';

// GET all exercises or filter by muscle group
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const muscleGroup = searchParams.get('muscleGroup');
    const search = searchParams.get('search');
    
    const db = getDb();
    
    let exercises: Exercise[];
    
    if (muscleGroup) {
      exercises = db.prepare(
        'SELECT * FROM exercises WHERE muscle_group = ? ORDER BY name'
      ).all(muscleGroup) as Exercise[];
    } else if (search) {
      exercises = db.prepare(
        'SELECT * FROM exercises WHERE name LIKE ? ORDER BY name'
      ).all(`%${search}%`) as Exercise[];
    } else {
      exercises = db.prepare(
        'SELECT * FROM exercises ORDER BY muscle_group, name'
      ).all() as Exercise[];
    }
    
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}

// POST create custom exercise
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, muscle_group, equipment, instructions } = body;
    const userId = 1; // TODO: Get from auth session
    
    const db = getDb();
    
    const insertExercise = db.prepare(
      'INSERT INTO exercises (name, muscle_group, equipment, instructions, is_custom, user_id) VALUES (?, ?, ?, ?, 1, ?)'
    );
    const result = insertExercise.run(name, muscle_group, equipment, instructions, userId);
    
    return NextResponse.json({ id: result.lastInsertRowid, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 });
  }
}

// DELETE custom exercise
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = 1; // TODO: Get from auth session
    
    if (!id) {
      return NextResponse.json({ error: 'Exercise ID required' }, { status: 400 });
    }
    
    const db = getDb();
    
    // Only allow deleting custom exercises
    const deleteExercise = db.prepare(
      'DELETE FROM exercises WHERE id = ? AND is_custom = 1 AND user_id = ?'
    );
    deleteExercise.run(id, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json({ error: 'Failed to delete exercise' }, { status: 500 });
  }
}
