import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { Task } from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId
};

export const app = initializeApp(firebaseConfig);

const dbId = (firebaseConfigData as any).firestoreDatabaseId;
export const db = dbId && dbId !== '(default)'
  ? getFirestore(app, dbId)
  : getFirestore(app);

const TASKS_COLLECTION = 'tasks';

export const subscribeToTasks = (onUpdate: (tasks: Task[]) => void, onError?: (err: Error) => void) => {
  const tasksRef = collection(db, TASKS_COLLECTION);
  return onSnapshot(
    tasksRef, 
    (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        tasks.push({
          id: docSnap.id,
          ...data
        } as Task);
      });
      onUpdate(tasks);
    },
    (err) => {
      console.error('Error listening to tasks from Firestore:', err);
      if (onError) onError(err);
    }
  );
};

export const fetchAllTasksOnce = async (): Promise<Task[]> => {
  const tasksRef = collection(db, TASKS_COLLECTION);
  const snapshot = await getDocs(tasksRef);
  const tasks: Task[] = [];
  snapshot.forEach((docSnap) => {
    tasks.push({
      id: docSnap.id,
      ...docSnap.data()
    } as Task);
  });
  return tasks;
};

export const saveTaskToDb = async (task: Task): Promise<void> => {
  if (!task.id) return;
  const taskRef = doc(db, TASKS_COLLECTION, task.id);
  // Clean undefined properties for Firestore
  const cleanTask = JSON.parse(JSON.stringify(task));
  await setDoc(taskRef, cleanTask, { merge: true });
};

export const batchSaveTasksToDb = async (tasks: Task[]): Promise<number> => {
  if (!tasks || tasks.length === 0) return 0;
  
  // Firestore batch limit is 500 operations per batch
  const BATCH_SIZE = 400;
  let count = 0;
  
  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const chunk = tasks.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    
    for (const task of chunk) {
      if (task && task.id) {
        const taskRef = doc(db, TASKS_COLLECTION, task.id);
        const cleanTask = JSON.parse(JSON.stringify(task));
        batch.set(taskRef, cleanTask, { merge: true });
        count++;
      }
    }
    
    await batch.commit();
  }
  
  return count;
};

export const updateTaskInDb = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  if (!taskId) return;
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  const cleanUpdates = JSON.parse(JSON.stringify(updates));
  await updateDoc(taskRef, cleanUpdates);
};

export const deleteTaskFromDb = async (taskId: string): Promise<void> => {
  if (!taskId) return;
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  await deleteDoc(taskRef);
};

export const clearAllTasksFromDb = async (tasks?: Task[]): Promise<void> => {
  const tasksToDelete = tasks && tasks.length > 0 ? tasks : await fetchAllTasksOnce();
  const BATCH_SIZE = 400;
  
  for (let i = 0; i < tasksToDelete.length; i += BATCH_SIZE) {
    const chunk = tasksToDelete.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    for (const t of chunk) {
      if (t.id) {
        const taskRef = doc(db, TASKS_COLLECTION, t.id);
        batch.delete(taskRef);
      }
    }
    await batch.commit();
  }
};

