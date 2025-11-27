// Type definitions for database models

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Exercise {
  id: number;
  name: string;
  muscle_group: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
  equipment: string;
  instructions: string;
  is_custom: number;
  user_id?: number;
  created_at: string;
}

export interface Workout {
  id: number;
  user_id: number;
  date: string;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
}

export interface WorkoutExercise {
  id: number;
  workout_id: number;
  exercise_id: number;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
  order_index: number;
}

export interface WorkoutWithExercises extends Workout {
  exercises: (WorkoutExercise & { exercise: Exercise })[];
}

export interface Goal {
  id: number;
  user_id: number;
  type: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'custom';
  title: string;
  description?: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  deadline?: string;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  completed_at?: string;
}

export interface BodyMeasurement {
  id: number;
  user_id: number;
  date: string;
  weight?: number;
  body_fat_percentage?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  bicep_left?: number;
  bicep_right?: number;
  thigh_left?: number;
  thigh_right?: number;
  notes?: string;
  created_at: string;
}

export interface NutritionFood {
  id: number;
  name: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_custom: number;
  user_id?: number;
  created_at: string;
}

export interface NutritionLog {
  id: number;
  user_id: number;
  food_id: number;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number;
  notes?: string;
  created_at: string;
}

export interface NutritionLogWithFood extends NutritionLog {
  food: NutritionFood;
}
