import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { NutritionLog, NutritionLogWithFood, NutritionFood } from '@/lib/types';

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user;
}

// GET nutrition logs
export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    const db = getDb();
    
    let logs: NutritionLogWithFood[];
    
    if (date) {
      const rawLogs = db.prepare(`
        SELECT nl.*, nf.name, nf.serving_size, nf.calories, nf.protein, nf.carbs, nf.fat
        FROM nutrition_logs nl
        JOIN nutrition_foods nf ON nl.food_id = nf.id
        WHERE nl.user_id = ? AND nl.date = ?
        ORDER BY nl.created_at
      `).all(userId, date) as any[];
      
      logs = rawLogs.map(log => ({
        id: log.id,
        user_id: log.user_id,
        food_id: log.food_id,
        date: log.date,
        meal_type: log.meal_type,
        servings: log.servings,
        notes: log.notes,
        created_at: log.created_at,
        food: {
          id: log.food_id,
          name: log.name,
          serving_size: log.serving_size,
          calories: log.calories,
          protein: log.protein,
          carbs: log.carbs,
          fat: log.fat,
        } as NutritionFood
      }));
    } else {
      const rawLogs = db.prepare(`
        SELECT nl.*, nf.name, nf.serving_size, nf.calories, nf.protein, nf.carbs, nf.fat
        FROM nutrition_logs nl
        JOIN nutrition_foods nf ON nl.food_id = nf.id
        WHERE nl.user_id = ?
        ORDER BY nl.date DESC, nl.created_at DESC
        LIMIT 100
      `).all(userId) as any[];
      
      logs = rawLogs.map(log => ({
        id: log.id,
        user_id: log.user_id,
        food_id: log.food_id,
        date: log.date,
        meal_type: log.meal_type,
        servings: log.servings,
        notes: log.notes,
        created_at: log.created_at,
        food: {
          id: log.food_id,
          name: log.name,
          serving_size: log.serving_size,
          calories: log.calories,
          protein: log.protein,
          carbs: log.carbs,
          fat: log.fat,
        } as NutritionFood
      }));
    }
    
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching nutrition logs:', error);
    return NextResponse.json({ error: 'Failed to fetch nutrition logs' }, { status: 500 });
  }
}

// POST create nutrition log
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const body = await request.json();
    const { food_id, date, meal_type, servings, notes } = body;
    
    const db = getDb();
    
    const insertLog = db.prepare(
      'INSERT INTO nutrition_logs (user_id, food_id, date, meal_type, servings, notes) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = insertLog.run(userId, food_id, date, meal_type, servings, notes);
    
    return NextResponse.json({ id: result.lastInsertRowid, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating nutrition log:', error);
    return NextResponse.json({ error: 'Failed to create nutrition log' }, { status: 500 });
  }
}

// DELETE nutrition log
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
      return NextResponse.json({ error: 'Log ID required' }, { status: 400 });
    }
    
    const db = getDb();
    
    const deleteLog = db.prepare('DELETE FROM nutrition_logs WHERE id = ? AND user_id = ?');
    deleteLog.run(id, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting nutrition log:', error);
    return NextResponse.json({ error: 'Failed to delete nutrition log' }, { status: 500 });
  }
}
