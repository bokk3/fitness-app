import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { Workout, WorkoutWithExercises, WorkoutExercise, Exercise } from '@/lib/types';

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user;
}

// GET all workouts or filter by date range
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
    
    let workouts: Workout[];
    
    if (startDate && endDate) {
      workouts = db.prepare(
        'SELECT * FROM workouts WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC'
      ).all(userId, startDate, endDate) as Workout[];
    } else {
      workouts = db.prepare(
        'SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT 50'
      ).all(userId) as Workout[];
    }
    
    // Fetch exercises for each workout
    const workoutsWithExercises: WorkoutWithExercises[] = workouts.map(workout => {
      const exercises = db.prepare(`
        SELECT we.*, e.name, e.muscle_group, e.equipment
        FROM workout_exercises we
        JOIN exercises e ON we.exercise_id = e.id
        WHERE we.workout_id = ?
        ORDER BY we.order_index
      `).all(workout.id) as (WorkoutExercise & { name: string; muscle_group: string; equipment: string })[];
      
      return {
        ...workout,
        exercises: exercises.map(ex => ({
          id: ex.id,
          workout_id: ex.workout_id,
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          notes: ex.notes,
          order_index: ex.order_index,
          exercise: {
            id: ex.exercise_id,
            name: ex.name,
            muscle_group: ex.muscle_group as any,
            equipment: ex.equipment,
          } as Exercise
        }))
      };
    });
    
    return NextResponse.json(workoutsWithExercises);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

// POST create new workout
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const body = await request.json();
    const { date, duration_minutes, notes, exercises } = body;
    
    const db = getDb();
    
    // Insert workout
    const insertWorkout = db.prepare(
      'INSERT INTO workouts (user_id, date, duration_minutes, notes) VALUES (?, ?, ?, ?)'
    );
    const result = insertWorkout.run(userId, date, duration_minutes, notes);
    const workoutId = result.lastInsertRowid;
    
    // Insert workout exercises
    if (exercises && exercises.length > 0) {
      const insertExercise = db.prepare(
        'INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, notes, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      
      exercises.forEach((ex: any, index: number) => {
        insertExercise.run(
          workoutId,
          ex.exercise_id,
          ex.sets,
          ex.reps,
          ex.weight || null,
          ex.notes || null,
          index
        );
      });
    }
    
    return NextResponse.json({ id: workoutId, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
  }
}

// PUT update workout
export async function PUT(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const body = await request.json();
    const { id, date, duration_minutes, notes } = body;
    
    const db = getDb();
    
    const updateWorkout = db.prepare(
      'UPDATE workouts SET date = ?, duration_minutes = ?, notes = ? WHERE id = ? AND user_id = ?'
    );
    updateWorkout.run(date, duration_minutes, notes, id, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 });
  }
}

// DELETE workout
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
      return NextResponse.json({ error: 'Workout ID required' }, { status: 400 });
    }
    
    const db = getDb();
    
    const deleteWorkout = db.prepare('DELETE FROM workouts WHERE id = ? AND user_id = ?');
    deleteWorkout.run(id, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}
