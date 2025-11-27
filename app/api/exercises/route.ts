import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { Exercise } from '@/lib/types';

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user;
}

// GET all exercises or filter by muscle group
export async function GET(request: Request) {
  try {
    const user = await getUser();
    const userId = user?.id;

    const { searchParams } = new URL(request.url);
    const muscleGroup = searchParams.get('muscleGroup');
    const search = searchParams.get('search');
    
    const db = getDb();
    
    let exercises: Exercise[];
    
    // Base query condition to show default exercises + user's custom ones
    const userCondition = userId ? '(is_custom = 0 OR user_id = ?)' : 'is_custom = 0';
    const params = userId ? [userId] : [];
    
    if (muscleGroup) {
      exercises = db.prepare(
        `SELECT * FROM exercises WHERE muscle_group = ? AND ${userCondition} ORDER BY name`
      ).all(muscleGroup, ...params) as Exercise[];
    } else if (search) {
      exercises = db.prepare(
        `SELECT * FROM exercises WHERE name LIKE ? AND ${userCondition} ORDER BY name`
      ).all(`%${search}%`, ...params) as Exercise[];
    } else {
      exercises = db.prepare(
        `SELECT * FROM exercises WHERE ${userCondition} ORDER BY muscle_group, name`
      ).all(...params) as Exercise[];
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
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const body = await request.json();
    const { name, muscle_group, equipment, instructions } = body;
    
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
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
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
