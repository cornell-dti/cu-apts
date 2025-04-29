import { db } from 'src/firebase-config';

export interface UserData {
  id: string;
  name: string;
  email: string;
}

// Retrieves all users.
export async function getAllUsers(): Promise<UserData[]> {
  console.log('Fetching user names and emails from Firebase...');

  try {
    const usersSnapshot = await db.collection('users').get();
    const users: UserData[] = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name || 'User',
        email: data.email || doc.id,
      });
    });

    console.log(`Successfully loaded ${users.length} users`);
    return users;
  } catch (error) {
    console.error('Error loading users:', error);
    throw error;
  }
}

/**
 * getUserBatches
 * Splits all users into batches of specified size for batch processing.
 *
 * @param batchSize - Number of users per batch (default: 50)
 * @returns Promise resolving to a 2D array of UserData, with each inner array representing a batch
 */
export async function getUserBatches(batchSize = 50): Promise<UserData[][]> {
  const allUsers = await getAllUsers();
  const batches: UserData[][] = [];

  for (let i = 0; i < allUsers.length; i += batchSize) {
    batches.push(allUsers.slice(i, i + batchSize));
  }

  console.log(`Created ${batches.length} batches of approximately ${batchSize} users each`);
  return batches;
}

const USERS: UserData[] = [];

(async () => {
  try {
    const loadedUsers = await getAllUsers();
    USERS.push(...loadedUsers); // Modifies array contents but keeps the constant reference
  } catch (error) {
    console.error('Failed to preload users:', error);
  }
})();

export { USERS };
