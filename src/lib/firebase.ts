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

export const saveTaskToDb = async (task: Task): Promise<void> => {
  if (!task.id) return;
  const taskRef = doc(db, TASKS_COLLECTION, task.id);
  // Clean undefined properties for Firestore
  const cleanTask = JSON.parse(JSON.stringify(task));
  await setDoc(taskRef, cleanTask, { merge: true });
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

export const clearAllTasksFromDb = async (tasks: Task[]): Promise<void> => {
  for (const t of tasks) {
    if (t.id) {
      await deleteTaskFromDb(t.id);
    }
  }
};
