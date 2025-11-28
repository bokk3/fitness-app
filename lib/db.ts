import Database from 'better-sqlite3';
import { join } from 'path';

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
  
  // Schema embedded to avoid file system issues with Docker volumes
  const schema = `
-- Fitness Tracking App Database Schema

-- Drop existing tables to ensure clean state for new auth system
DROP TABLE IF EXISTS nutrition_logs;
DROP TABLE IF EXISTS nutrition_foods;
DROP TABLE IF EXISTS body_measurements;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS workout_exercises;
DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS verification;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS users;

-- Better Auth Tables

-- User table
CREATE TABLE user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL,
    image TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- Session table
CREATE TABLE session (
    id TEXT PRIMARY KEY,
    expires_at DATETIME NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES user(id)
);

-- Account table
CREATE TABLE account (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES user(id),
    access_token TEXT,
    refresh_token TEXT,
    expires_at DATETIME,
    id_token TEXT,
    password TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- Verification table
CREATE TABLE verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME,
    updated_at DATETIME
);

-- App Tables

-- Exercise library
CREATE TABLE exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL, -- chest, back, legs, shoulders, arms, core, cardio
  equipment TEXT, -- barbell, dumbbell, machine, bodyweight, cable, etc.
  instructions TEXT,
  is_custom INTEGER DEFAULT 0, -- 0 for default exercises, 1 for user-created
  user_id TEXT, -- Changed to TEXT to match user.id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Workouts
CREATE TABLE workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL, -- Changed to TEXT
  date DATE NOT NULL,
  duration_minutes INTEGER, -- total workout duration
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Workout exercises (individual exercises within a workout)
CREATE TABLE workout_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight REAL, -- weight in kg or lbs
  notes TEXT,
  order_index INTEGER DEFAULT 0, -- order of exercises in workout
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Goals
CREATE TABLE goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL, -- Changed to TEXT
  type TEXT NOT NULL, -- weight_loss, muscle_gain, strength, endurance, custom
  title TEXT NOT NULL,
  description TEXT,
  target_value REAL, -- numeric target (e.g., weight, reps)
  current_value REAL DEFAULT 0,
  unit TEXT, -- kg, lbs, reps, minutes, etc.
  deadline DATE,
  status TEXT DEFAULT 'active', -- active, completed, abandoned
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Body measurements
CREATE TABLE body_measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL, -- Changed to TEXT
  date DATE NOT NULL,
  weight REAL, -- in kg or lbs
  body_fat_percentage REAL,
  chest REAL, -- measurements in cm or inches
  waist REAL,
  hips REAL,
  bicep_left REAL,
  bicep_right REAL,
  thigh_left REAL,
  thigh_right REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Nutrition foods database
CREATE TABLE nutrition_foods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  serving_size TEXT, -- e.g., "100g", "1 cup"
  calories REAL NOT NULL,
  protein REAL, -- in grams
  carbs REAL, -- in grams
  fat REAL, -- in grams
  is_custom INTEGER DEFAULT 0,
  user_id TEXT, -- Changed to TEXT
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Nutrition logs (daily food intake)
CREATE TABLE nutrition_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL, -- Changed to TEXT
  food_id INTEGER NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT, -- breakfast, lunch, dinner, snack
  servings REAL DEFAULT 1,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES nutrition_foods(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);
CREATE INDEX idx_body_measurements_user_date ON body_measurements(user_id, date);
CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, date);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
`;
  
  // Check if database is already initialized
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user'").get();
  
  if (!tableExists) {
    // Execute schema only if tables don't exist
    db.exec(schema);
  }
  
  // Check if we need to seed data
  const userCount = db.prepare('SELECT COUNT(*) as count FROM user').get() as { count: number };
  
  if (userCount.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  if (!db) return;
  
  console.log('Seeding database...');
  
  // Create default user (use INSERT OR IGNORE to handle parallel builds)
  const insertUser = db.prepare('INSERT OR IGNORE INTO user (id, email, name, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
  const now = new Date().toISOString();
  // Using a fixed UUID for demo user to ensure consistency if needed
  const userId = 'demo-user-id'; 
  insertUser.run(userId, 'demo@fitness.app', 'Demo User', 1, now, now);
  
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
    'INSERT OR IGNORE INTO exercises (name, muscle_group, equipment, instructions) VALUES (?, ?, ?, ?)'
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
    'INSERT OR IGNORE INTO nutrition_foods (name, serving_size, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?)'
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
