import Database from 'better-sqlite3';
import { join } from 'path';
import { readFileSync } from 'fs';

const dbPath = join(process.cwd(), 'db', 'fitness.db');
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  if (!db) return;
  
  const schemaPath = join(process.cwd(), 'db', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  
  // Execute schema
  db.exec(schema);
  
  // Check if we need to seed data
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  if (!db) return;
  
  console.log('Seeding database...');
  
  // Create default user
  const insertUser = db.prepare('INSERT INTO users (email, name) VALUES (?, ?)');
  insertUser.run('demo@fitness.app', 'Demo User');
  
  // Seed exercise library
  const exercises = [
    // Chest
    { name: 'Bench Press', muscle_group: 'chest', equipment: 'barbell', instructions: 'Lie on bench, lower bar to chest, press up' },
    { name: 'Incline Dumbbell Press', muscle_group: 'chest', equipment: 'dumbbell', instructions: 'Press dumbbells on incline bench' },
    { name: 'Push-ups', muscle_group: 'chest', equipment: 'bodyweight', instructions: 'Lower body to ground, push back up' },
    { name: 'Cable Flyes', muscle_group: 'chest', equipment: 'cable', instructions: 'Pull cables together in front of chest' },
    { name: 'Dips', muscle_group: 'chest', equipment: 'bodyweight', instructions: 'Lower body between parallel bars, push up' },
    
    // Back
    { name: 'Deadlift', muscle_group: 'back', equipment: 'barbell', instructions: 'Lift bar from ground to standing position' },
    { name: 'Pull-ups', muscle_group: 'back', equipment: 'bodyweight', instructions: 'Pull body up to bar, lower down' },
    { name: 'Barbell Row', muscle_group: 'back', equipment: 'barbell', instructions: 'Bend over, pull bar to chest' },
    { name: 'Lat Pulldown', muscle_group: 'back', equipment: 'machine', instructions: 'Pull bar down to chest' },
    { name: 'Seated Cable Row', muscle_group: 'back', equipment: 'cable', instructions: 'Pull cable to torso while seated' },
    { name: 'T-Bar Row', muscle_group: 'back', equipment: 'barbell', instructions: 'Pull loaded bar to chest' },
    
    // Legs
    { name: 'Squat', muscle_group: 'legs', equipment: 'barbell', instructions: 'Lower hips from standing, return to standing' },
    { name: 'Leg Press', muscle_group: 'legs', equipment: 'machine', instructions: 'Push platform away with feet' },
    { name: 'Romanian Deadlift', muscle_group: 'legs', equipment: 'barbell', instructions: 'Lower bar while keeping legs straight' },
    { name: 'Leg Curl', muscle_group: 'legs', equipment: 'machine', instructions: 'Curl legs up against resistance' },
    { name: 'Leg Extension', muscle_group: 'legs', equipment: 'machine', instructions: 'Extend legs against resistance' },
    { name: 'Lunges', muscle_group: 'legs', equipment: 'bodyweight', instructions: 'Step forward, lower back knee, return' },
    { name: 'Calf Raises', muscle_group: 'legs', equipment: 'bodyweight', instructions: 'Raise heels off ground, lower down' },
    
    // Shoulders
    { name: 'Overhead Press', muscle_group: 'shoulders', equipment: 'barbell', instructions: 'Press bar overhead from shoulders' },
    { name: 'Dumbbell Shoulder Press', muscle_group: 'shoulders', equipment: 'dumbbell', instructions: 'Press dumbbells overhead' },
    { name: 'Lateral Raises', muscle_group: 'shoulders', equipment: 'dumbbell', instructions: 'Raise dumbbells to sides' },
    { name: 'Front Raises', muscle_group: 'shoulders', equipment: 'dumbbell', instructions: 'Raise dumbbells to front' },
    { name: 'Face Pulls', muscle_group: 'shoulders', equipment: 'cable', instructions: 'Pull cable to face level' },
    { name: 'Arnold Press', muscle_group: 'shoulders', equipment: 'dumbbell', instructions: 'Press dumbbells with rotation' },
    
    // Arms
    { name: 'Barbell Curl', muscle_group: 'arms', equipment: 'barbell', instructions: 'Curl bar to shoulders' },
    { name: 'Tricep Dips', muscle_group: 'arms', equipment: 'bodyweight', instructions: 'Lower and raise body on parallel bars' },
    { name: 'Hammer Curls', muscle_group: 'arms', equipment: 'dumbbell', instructions: 'Curl dumbbells with neutral grip' },
    { name: 'Tricep Pushdown', muscle_group: 'arms', equipment: 'cable', instructions: 'Push cable down to extend arms' },
    { name: 'Skull Crushers', muscle_group: 'arms', equipment: 'barbell', instructions: 'Lower bar to forehead, extend arms' },
    { name: 'Preacher Curl', muscle_group: 'arms', equipment: 'barbell', instructions: 'Curl bar on preacher bench' },
    
    // Core
    { name: 'Plank', muscle_group: 'core', equipment: 'bodyweight', instructions: 'Hold body straight in push-up position' },
    { name: 'Crunches', muscle_group: 'core', equipment: 'bodyweight', instructions: 'Curl upper body towards knees' },
    { name: 'Russian Twists', muscle_group: 'core', equipment: 'bodyweight', instructions: 'Rotate torso side to side' },
    { name: 'Hanging Leg Raises', muscle_group: 'core', equipment: 'bodyweight', instructions: 'Raise legs while hanging from bar' },
    { name: 'Cable Crunches', muscle_group: 'core', equipment: 'cable', instructions: 'Crunch down with cable resistance' },
    { name: 'Ab Wheel', muscle_group: 'core', equipment: 'bodyweight', instructions: 'Roll wheel forward and back' },
    
    // Cardio
    { name: 'Running', muscle_group: 'cardio', equipment: 'bodyweight', instructions: 'Run at steady pace' },
    { name: 'Cycling', muscle_group: 'cardio', equipment: 'machine', instructions: 'Cycle at steady pace' },
    { name: 'Rowing', muscle_group: 'cardio', equipment: 'machine', instructions: 'Row at steady pace' },
    { name: 'Jump Rope', muscle_group: 'cardio', equipment: 'bodyweight', instructions: 'Jump over rope continuously' },
    { name: 'Burpees', muscle_group: 'cardio', equipment: 'bodyweight', instructions: 'Drop to push-up, jump up' },
  ];
  
  const insertExercise = db.prepare(
    'INSERT INTO exercises (name, muscle_group, equipment, instructions) VALUES (?, ?, ?, ?)'
  );
  
  for (const exercise of exercises) {
    insertExercise.run(exercise.name, exercise.muscle_group, exercise.equipment, exercise.instructions);
  }
  
  // Seed some common foods
  const foods = [
    { name: 'Chicken Breast', serving_size: '100g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: 'Brown Rice', serving_size: '100g', calories: 112, protein: 2.6, carbs: 24, fat: 0.9 },
    { name: 'Broccoli', serving_size: '100g', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
    { name: 'Salmon', serving_size: '100g', calories: 208, protein: 20, carbs: 0, fat: 13 },
    { name: 'Eggs', serving_size: '1 large', calories: 72, protein: 6, carbs: 0.4, fat: 5 },
    { name: 'Oatmeal', serving_size: '100g', calories: 389, protein: 17, carbs: 66, fat: 7 },
    { name: 'Banana', serving_size: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    { name: 'Greek Yogurt', serving_size: '100g', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
    { name: 'Almonds', serving_size: '28g', calories: 164, protein: 6, carbs: 6, fat: 14 },
    { name: 'Sweet Potato', serving_size: '100g', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  ];
  
  const insertFood = db.prepare(
    'INSERT INTO nutrition_foods (name, serving_size, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?)'
  );
  
  for (const food of foods) {
    insertFood.run(food.name, food.serving_size, food.calories, food.protein, food.carbs, food.fat);
  }
  
  console.log('Database seeded successfully!');
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
