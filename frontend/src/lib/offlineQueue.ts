/**
 * Rural PHC Offline Queue Engine
 * ----------------------------------------------------
 * Enables Primary Health Centres (PHCs), sub-centres, and rural clinics
 * with intermittent or zero connectivity to document clinical encounters,
 * conditions, and lab orders locally in indexed local storage.
 * Automatically detects network restoration and syncs queued transactions
 * directly into ABDM-compliant HealthOS cloud storage.
 */

export interface QueuedRecord {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  payload: any;
  summary: string;
  patientName?: string;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retryCount: number;
  lastError?: string;
}

const STORAGE_KEY = 'medindia_phc_offline_queue_v1';
const SIMULATED_OFFLINE_KEY = 'medindia_phc_simulated_offline';

export class OfflineQueueManager {
  private static subscribers: Array<(queue: QueuedRecord[]) => void> = [];
  private static networkSubscribers: Array<(isOnline: boolean) => void> = [];

  /**
   * Check if the browser currently has network access (factoring in manual simulation toggle)
   */
  public static isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    const isSimulatedOffline = localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
    if (isSimulatedOffline) return false;
    return navigator.onLine;
  }

  /**
   * Toggle simulated offline mode for demonstration/field testing in rural scenarios
   */
  public static setSimulatedOffline(offline: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SIMULATED_OFFLINE_KEY, offline ? 'true' : 'false');
    this.notifyNetworkSubscribers(!offline && navigator.onLine);
  }

  public static isSimulatedOffline(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
  }

  /**
   * Retrieve all items currently in the queue
   */
  public static getQueue(): QueuedRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read offline queue from localStorage:', e);
      return [];
    }
  }

  /**
   * Save queue to storage and notify subscribers
   */
  private static saveQueue(queue: QueuedRecord[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      this.notifySubscribers(queue);
    } catch (e) {
      console.error('Failed to save offline queue to localStorage:', e);
    }
  }

  /**
   * Add a new clinical operation to the offline queue
   */
  public static enqueue(
    endpoint: string,
    method: string,
    payload: any,
    summary: string,
    patientName?: string
  ): QueuedRecord {
    const record: QueuedRecord = {
      id: 'PHC-OFFLINE-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      endpoint,
      method: method.toUpperCase(),
      payload,
      summary,
      patientName,
      status: 'PENDING',
      retryCount: 0,
    };

    const current = this.getQueue();
    current.push(record);
    this.saveQueue(current);
    return record;
  }

  /**
   * Remove an item from the queue
   */
  public static remove(id: string): void {
    const current = this.getQueue().filter((item) => item.id !== id);
    this.saveQueue(current);
  }

  /**
   * Clear all synced or failed records
   */
  public static clearCompleted(): void {
    const current = this.getQueue().filter((item) => item.status === 'PENDING');
    this.saveQueue(current);
  }

  /**
   * Full clear
   */
  public static clearAll(): void {
    this.saveQueue([]);
  }

  /**
   * Sync all pending records to the backend server
   */
  public static async syncQueue(
    token: string,
    apiBase: string = 'http://localhost:8000'
  ): Promise<{ synced: number; failed: number }> {
    if (!this.isOnline()) {
      return { synced: 0, failed: 0 };
    }

    const queue = this.getQueue();
    const pending = queue.filter((r) => r.status === 'PENDING' || r.status === 'FAILED');

    let synced = 0;
    let failed = 0;

    for (const record of pending) {
      record.status = 'SYNCING';
      this.saveQueue([...queue]);

      try {
        const res = await fetch(`${apiBase}${record.endpoint}`, {
          method: record.method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(record.payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ detail: res.statusText }));
          throw new Error(errData.detail || `Server responded with ${res.status}`);
        }

        record.status = 'SYNCED';
        synced++;
      } catch (err: any) {
        record.status = 'FAILED';
        record.retryCount++;
        record.lastError = err.message || 'Network sync error';
        failed++;
      }

      this.saveQueue([...queue]);
    }

    // Auto-clean synced records after short delay
    setTimeout(() => {
      const remaining = this.getQueue().filter((r) => r.status !== 'SYNCED');
      this.saveQueue(remaining);
    }, 4000);

    return { synced, failed };
  }

  /**
   * Subscribe to queue modifications
   */
  public static subscribe(callback: (queue: QueuedRecord[]) => void): () => void {
    this.subscribers.push(callback);
    callback(this.getQueue());
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== callback);
    };
  }

  private static notifySubscribers(queue: QueuedRecord[]): void {
    for (const sub of this.subscribers) {
      try {
        sub(queue);
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Subscribe to network changes
   */
  public static subscribeNetwork(callback: (isOnline: boolean) => void): () => void {
    this.networkSubscribers.push(callback);
    callback(this.isOnline());

    if (typeof window !== 'undefined') {
      const handleOnline = () => this.notifyNetworkSubscribers(!this.isSimulatedOffline());
      const handleOffline = () => this.notifyNetworkSubscribers(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        this.networkSubscribers = this.networkSubscribers.filter((s) => s !== callback);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return () => {
      this.networkSubscribers = this.networkSubscribers.filter((s) => s !== callback);
    };
  }

  private static notifyNetworkSubscribers(isOnline: boolean): void {
    for (const sub of this.networkSubscribers) {
      try {
        sub(isOnline);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
