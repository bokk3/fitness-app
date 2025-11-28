import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'db', 'fitness.db');
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    try {
      db = new Database(dbPath);
      db.pragma('busy_timeout = 5000'); // Set timeout FIRST
      db.pragma('journal_mode = WAL');
      
      initializeDatabase();
    } catch (error) {
      // Ignore errors during build phase when multiple workers compete
      // If db was created but init failed, we still return it
      if (process.env.NODE_ENV !== 'production') {
        console.error('Database initialization error:', error);
      }
      
      // If we failed to create the db instance, we must throw or return null (but type says Database)
      // In build context, it's better to swallow and hope the other worker succeeded
      if (!db) {
         // Fallback to a new instance if the first one failed completely (unlikely)
         db = new Database(dbPath);
      }
    }
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
    access_token_expires_at DATETIME,
    refresh_token_expires_at DATETIME,
    scope TEXT,
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
  try {
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user'").get();
    
    if (!tableExists) {
      // Execute schema only if tables don't exist
      db.exec(schema);
    }
  } catch (error: unknown) {
    // If table already exists due to race condition, that's fine
    const err = error as { code?: string };
    if (err.code !== 'SQLITE_SCHEMA' && err.code !== 'SQLITE_ERROR') {
      throw error;
    }
  }
  
  // Check if we need to seed data
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM user').get() as { count: number };
    
    if (userCount.count === 0) {
      seedDatabase();
    }
  } catch (error: unknown) {
    // If seeding fails due to race condition, that's fine
    const err = error as { code?: string };
    if (err.code !== 'SQLITE_CONSTRAINT' && err.code !== 'SQLITE_BUSY') {
      throw error;
    }
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
    // Borst
    { name: 'Bankdrukken', muscle_group: 'borst', equipment: 'halter', instructions: 'Lig op de bank, laat de stang zakken tot de borst, duw omhoog' },
    { name: 'Schuin Bankdrukken (Dumbbell)', muscle_group: 'borst', equipment: 'dumbbell', instructions: 'Druk dumbbells op een schuine bank' },
    { name: 'Opdrukken', muscle_group: 'borst', equipment: 'lichaamsgewicht', instructions: 'Laat het lichaam zakken tot de grond, duw weer omhoog' },
    { name: 'Cable Flyes', muscle_group: 'borst', equipment: 'kabel', instructions: 'Trek kabels naar elkaar toe voor de borst' },
    { name: 'Dips', muscle_group: 'borst', equipment: 'lichaamsgewicht', instructions: 'Laat het lichaam zakken tussen parallelle stangen, duw omhoog' },
    
    // Rug
    { name: 'Deadlift', muscle_group: 'rug', equipment: 'halter', instructions: 'Til de stang van de grond naar staande positie' },
    { name: 'Pull-ups', muscle_group: 'rug', equipment: 'lichaamsgewicht', instructions: 'Trek het lichaam op aan de stang, laat zakken' },
    { name: 'Barbell Row', muscle_group: 'rug', equipment: 'halter', instructions: 'Buig voorover, trek de stang naar de borst' },
    { name: 'Lat Pulldown', muscle_group: 'rug', equipment: 'machine', instructions: 'Trek de stang naar beneden tot de borst' },
    { name: 'Zittend Kabelroeien', muscle_group: 'rug', equipment: 'kabel', instructions: 'Trek de kabel naar de romp terwijl je zit' },
    { name: 'T-Bar Row', muscle_group: 'rug', equipment: 'halter', instructions: 'Trek de geladen stang naar de borst' },
    
    // Benen
    { name: 'Squat', muscle_group: 'benen', equipment: 'halter', instructions: 'Laat de heupen zakken vanuit stand, keer terug naar stand' },
    { name: 'Leg Press', muscle_group: 'benen', equipment: 'machine', instructions: 'Duw het platform weg met de voeten' },
    { name: 'Roemeense Deadlift', muscle_group: 'benen', equipment: 'halter', instructions: 'Laat de stang zakken met gestrekte benen' },
    { name: 'Leg Curl', muscle_group: 'benen', equipment: 'machine', instructions: 'Krul de benen omhoog tegen weerstand' },
    { name: 'Leg Extension', muscle_group: 'benen', equipment: 'machine', instructions: 'Strek de benen tegen weerstand' },
    { name: 'Lunges', muscle_group: 'benen', equipment: 'lichaamsgewicht', instructions: 'Stap naar voren, laat achterste knie zakken, keer terug' },
    { name: 'Calf Raises', muscle_group: 'benen', equipment: 'lichaamsgewicht', instructions: 'Til hielen van de grond, laat zakken' },
    
    // Schouders
    { name: 'Overhead Press', muscle_group: 'schouders', equipment: 'halter', instructions: 'Druk de stang boven het hoofd vanuit de schouders' },
    { name: 'Dumbbell Shoulder Press', muscle_group: 'schouders', equipment: 'dumbbell', instructions: 'Druk dumbbells boven het hoofd' },
    { name: 'Lateral Raises', muscle_group: 'schouders', equipment: 'dumbbell', instructions: 'Til dumbbells zijwaarts op' },
    { name: 'Front Raises', muscle_group: 'schouders', equipment: 'dumbbell', instructions: 'Til dumbbells naar voren op' },
    { name: 'Face Pulls', muscle_group: 'schouders', equipment: 'kabel', instructions: 'Trek de kabel naar gezichtshoogte' },
    { name: 'Arnold Press', muscle_group: 'schouders', equipment: 'dumbbell', instructions: 'Druk dumbbells met rotatie' },
    
    // Armen
    { name: 'Barbell Curl', muscle_group: 'armen', equipment: 'halter', instructions: 'Krul de stang naar de schouders' },
    { name: 'Tricep Dips', muscle_group: 'armen', equipment: 'lichaamsgewicht', instructions: 'Laat het lichaam zakken en duw op aan parallelle stangen' },
    { name: 'Hammer Curls', muscle_group: 'armen', equipment: 'dumbbell', instructions: 'Krul dumbbells met neutrale greep' },
    { name: 'Tricep Pushdown', muscle_group: 'armen', equipment: 'kabel', instructions: 'Duw de kabel naar beneden om armen te strekken' },
    { name: 'Skull Crushers', muscle_group: 'armen', equipment: 'halter', instructions: 'Laat de stang naar het voorhoofd zakken, strek armen' },
    { name: 'Preacher Curl', muscle_group: 'armen', equipment: 'halter', instructions: 'Krul de stang op een preacher bank' },
    
    // Buikspieren
    { name: 'Plank', muscle_group: 'buikspieren', equipment: 'lichaamsgewicht', instructions: 'Houd het lichaam recht in opdrukpositie' },
    { name: 'Crunches', muscle_group: 'buikspieren', equipment: 'lichaamsgewicht', instructions: 'Krul het bovenlichaam naar de knieën' },
    { name: 'Russian Twists', muscle_group: 'buikspieren', equipment: 'lichaamsgewicht', instructions: 'Draai de romp van links naar rechts' },
    { name: 'Hanging Leg Raises', muscle_group: 'buikspieren', equipment: 'lichaamsgewicht', instructions: 'Til benen op terwijl je aan de stang hangt' },
    { name: 'Cable Crunches', muscle_group: 'buikspieren', equipment: 'kabel', instructions: 'Crunch naar beneden met kabelweerstand' },
    { name: 'Ab Wheel', muscle_group: 'buikspieren', equipment: 'lichaamsgewicht', instructions: 'Rol het wiel naar voren en terug' },
    
    // Cardio
    { name: 'Hardlopen', muscle_group: 'cardio', equipment: 'lichaamsgewicht', instructions: 'Ren in een gestaag tempo' },
    { name: 'Fietsen', muscle_group: 'cardio', equipment: 'machine', instructions: 'Fiets in een gestaag tempo' },
    { name: 'Roeien', muscle_group: 'cardio', equipment: 'machine', instructions: 'Roei in een gestaag tempo' },
    { name: 'Touwtjespringen', muscle_group: 'cardio', equipment: 'lichaamsgewicht', instructions: 'Spring continu over het touw' },
    { name: 'Burpees', muscle_group: 'cardio', equipment: 'lichaamsgewicht', instructions: 'Zak naar opdrukstand, spring omhoog' },
  ];
  
  const insertExercise = db.prepare(
    'INSERT OR IGNORE INTO exercises (name, muscle_group, equipment, instructions) VALUES (?, ?, ?, ?)'
  );
  
  for (const exercise of exercises) {
    insertExercise.run(exercise.name, exercise.muscle_group, exercise.equipment, exercise.instructions);
  }
  
  // Seed some common foods
  const foods = [
    { name: 'Kippenborst', serving_size: '100g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: 'Zilvervliesrijst', serving_size: '100g', calories: 112, protein: 2.6, carbs: 24, fat: 0.9 },
    { name: 'Broccoli', serving_size: '100g', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
    { name: 'Zalm', serving_size: '100g', calories: 208, protein: 20, carbs: 0, fat: 13 },
    { name: 'Eieren', serving_size: '1 grote', calories: 72, protein: 6, carbs: 0.4, fat: 5 },
    { name: 'Havermout', serving_size: '100g', calories: 389, protein: 17, carbs: 66, fat: 7 },
    { name: 'Banaan', serving_size: '1 middelgrote', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    { name: 'Griekse Yoghurt', serving_size: '100g', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
    { name: 'Amandelen', serving_size: '28g', calories: 164, protein: 6, carbs: 6, fat: 14 },
    { name: 'Zoete Aardappel', serving_size: '100g', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
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
