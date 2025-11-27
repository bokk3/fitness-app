import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { NutritionFood } from '@/lib/types';

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user;
}

// GET all foods
export async function GET(request: Request) {
  try {
    const user = await getUser();
    const userId = user?.id;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    const db = getDb();
    
    let foods: NutritionFood[];
    
    // Base query condition to show default foods + user's custom ones
    const userCondition = userId ? '(is_custom = 0 OR user_id = ?)' : 'is_custom = 0';
    const params = userId ? [userId] : [];
    
    if (search) {
      foods = db.prepare(
        `SELECT * FROM nutrition_foods WHERE name LIKE ? AND ${userCondition} ORDER BY name LIMIT 50`
      ).all(`%${search}%`, ...params) as NutritionFood[];
    } else {
      foods = db.prepare(
        `SELECT * FROM nutrition_foods WHERE ${userCondition} ORDER BY name LIMIT 100`
      ).all(...params) as NutritionFood[];
    }
    
    return NextResponse.json(foods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    return NextResponse.json({ error: 'Failed to fetch foods' }, { status: 500 });
  }
}

// POST create custom food
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const body = await request.json();
    const { name, serving_size, calories, protein, carbs, fat } = body;
    
    const db = getDb();
    
    const insertFood = db.prepare(
      'INSERT INTO nutrition_foods (name, serving_size, calories, protein, carbs, fat, is_custom, user_id) VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
    );
    const result = insertFood.run(name, serving_size, calories, protein, carbs, fat, userId);
    
    return NextResponse.json({ id: result.lastInsertRowid, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating food:', error);
    return NextResponse.json({ error: 'Failed to create food' }, { status: 500 });
  }
}
