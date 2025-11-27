import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { NutritionFood } from '@/lib/types';

// GET all foods
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    const db = getDb();
    
    let foods: NutritionFood[];
    
    if (search) {
      foods = db.prepare(
        'SELECT * FROM nutrition_foods WHERE name LIKE ? ORDER BY name LIMIT 50'
      ).all(`%${search}%`) as NutritionFood[];
    } else {
      foods = db.prepare(
        'SELECT * FROM nutrition_foods ORDER BY name LIMIT 100'
      ).all() as NutritionFood[];
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
    const body = await request.json();
    const { name, serving_size, calories, protein, carbs, fat } = body;
    const userId = 1; // TODO: Get from auth session
    
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
