import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { Goal } from '@/lib/types';

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user;
}

// GET all goals
export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const db = getDb();
    
    let goals: Goal[];
    
    if (status) {
      goals = db.prepare(
        'SELECT * FROM goals WHERE user_id = ? AND status = ? ORDER BY created_at DESC'
      ).all(userId, status) as Goal[];
    } else {
      goals = db.prepare(
        'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC'
      ).all(userId) as Goal[];
    }
    
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

// POST create new goal
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const body = await request.json();
    const { type, title, description, target_value, unit, deadline } = body;
    
    const db = getDb();
    
    const insertGoal = db.prepare(
      'INSERT INTO goals (user_id, type, title, description, target_value, unit, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const result = insertGoal.run(userId, type, title, description, target_value, unit, deadline);
    
    return NextResponse.json({ id: result.lastInsertRowid, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

// PUT update goal
export async function PUT(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const body = await request.json();
    const { id, current_value, status } = body;
    
    const db = getDb();
    
    let query = 'UPDATE goals SET current_value = ?';
    const params: any[] = [current_value];
    
    if (status) {
      query += ', status = ?';
      params.push(status);
      
      if (status === 'completed') {
        query += ', completed_at = CURRENT_TIMESTAMP';
      }
    }
    
    query += ' WHERE id = ? AND user_id = ?';
    params.push(id, userId);
    
    const updateGoal = db.prepare(query);
    updateGoal.run(...params);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

// DELETE goal
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
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    }
    
    const db = getDb();
    
    const deleteGoal = db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?');
    deleteGoal.run(id, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
