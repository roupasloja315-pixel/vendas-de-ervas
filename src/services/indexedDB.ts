import { Cliente, Venda, Categoria, Nicho, SaborErva } from '../types';

const DB_NAME = 'TerereCRM';
const DB_VERSION = 1;

export class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        const stores = [
          { name: 'clientes', keyPath: 'id' },
          { name: 'vendas', keyPath: 'id' },
          { name: 'categorias', keyPath: 'id' },
          { name: 'nichos', keyPath: 'id' },
          { name: 'sabores', keyPath: 'id' },
          { name: 'sync_queue', keyPath: 'id', autoIncrement: true }
        ];

        stores.forEach(store => {
          if (!db.objectStoreNames.contains(store.name)) {
            db.createObjectStore(store.name, { keyPath: store.keyPath, autoIncrement: store.autoIncrement });
          }
        });
      };
    });
  }

  async addCliente(cliente: Cliente): Promise<string> {
    const tx = this.db!.transaction(['clientes', 'sync_queue'], 'readwrite');
    const store = tx.objectStore('clientes');
    const id = cliente.id || crypto.randomUUID();
    const clienteWithId = { ...cliente, id, sync_status: 'pending' };

    await new Promise((resolve, reject) => {
      store.add(clienteWithId);
      tx.oncomplete = () => resolve(null);
      tx.onerror = () => reject(tx.error);
    });

    await this.addToSyncQueue({ type: 'cliente', action: 'add', data: clienteWithId });
    return id;
  }

  async updateCliente(cliente: Cliente): Promise<void> {
    const tx = this.db!.transaction(['clientes', 'sync_queue'], 'readwrite');
    const store = tx.objectStore('clientes');
    const updated = { ...cliente, sync_status: 'pending' };

    await new Promise((resolve, reject) => {
      store.put(updated);
      tx.oncomplete = () => resolve(null);
      tx.onerror = () => reject(tx.error);
    });

    await this.addToSyncQueue({ type: 'cliente', action: 'update', data: updated });
  }

  async getClientes(): Promise<Cliente[]> {
    const store = this.db!.transaction('clientes').objectStore('clientes');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getClienteById(id: string): Promise<Cliente | null> {
    const store = this.db!.transaction('clientes').objectStore('clientes');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCliente(id: string): Promise<void> {
    const tx = this.db!.transaction(['clientes', 'sync_queue'], 'readwrite');
    const store = tx.objectStore('clientes');

    await new Promise((resolve, reject) => {
      store.delete(id);
      tx.oncomplete = () => resolve(null);
      tx.onerror = () => reject(tx.error);
    });

    await this.addToSyncQueue({ type: 'cliente', action: 'delete', data: { id } });
  }

  async addVenda(venda: Venda): Promise<string> {
    const tx = this.db!.transaction(['vendas', 'sync_queue'], 'readwrite');
    const store = tx.objectStore('vendas');
    const id = venda.id || crypto.randomUUID();
    const vendaWithId = { ...venda, id, sync_status: 'pending' };

    await new Promise((resolve, reject) => {
      store.add(vendaWithId);
      tx.oncomplete = () => resolve(null);
      tx.onerror = () => reject(tx.error);
    });

    await this.addToSyncQueue({ type: 'venda', action: 'add', data: vendaWithId });
    return id;
  }

  async updateVenda(venda: Venda): Promise<void> {
    const tx = this.db!.transaction(['vendas', 'sync_queue'], 'readwrite');
    const store = tx.objectStore('vendas');
    const updated = { ...venda, sync_status: 'pending' };

    await new Promise((resolve, reject) => {
      store.put(updated);
      tx.oncomplete = () => resolve(null);
      tx.onerror = () => reject(tx.error);
    });

    await this.addToSyncQueue({ type: 'venda', action: 'update', data: updated });
  }

  async getVendas(): Promise<Venda[]> {
    const store = this.db!.transaction('vendas').objectStore('vendas');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteVenda(id: string): Promise<void> {
    const tx = this.db!.transaction(['vendas', 'sync_queue'], 'readwrite');
    const store = tx.objectStore('vendas');

    await new Promise((resolve, reject) => {
      store.delete(id);
      tx.oncomplete = () => resolve(null);
      tx.onerror = () => reject(tx.error);
    });

    await this.addToSyncQueue({ type: 'venda', action: 'delete', data: { id } });
  }

  async addCategoria(categoria: Categoria): Promise<string> {
    const tx = this.db!.transaction(['categorias', 'sync_queue'], 'readwrite');
    const store = tx.objectStore('categorias');
    const id = categoria.id || crypto.randomUUID();
    const catWithId = { ...categoria, id, sync_status: 'pending' };

    await new Promise((resolve, reject) => {
      store.add(catWithId);
      tx.oncomplete = () => resolve(null);
      tx.onerror = () => reject(tx.error);
    });

    await this.addToSyncQueue({ type: 'categoria', action: 'add', data: catWithId });
    return id;
  }

  async getCategorias(): Promise<Categoria[]> {
    const store = this.db!.transaction('categorias').objectStore('categorias');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addNicho(nicho: Nicho): Promise<string> {
    const tx = this.db!.transaction(['nichos', 'sync_queue'], 'readwrite');
    const store = tx.objectStore('nichos');
    const id = nicho.id || crypto.randomUUID();
    const nichoWithId = { ...nicho, id, sync_status: 'pending' };

    await new Promise((resolve, reject) => {
      store.add(nichoWithId);
      tx.oncomplete = () => resolve(null);
      tx.onerror = () => reject(tx.error);
    });

    await this.addToSyncQueue({ type: 'nicho', action: 'add', data: nichoWithId });
    return id;
  }

  async getNichos(): Promise<Nicho[]> {
    const store = this.db!.transaction('nichos').objectStore('nichos');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addSabor(sabor: SaborErva): Promise<string> {
    const tx = this.db!.transaction(['sabores', 'sync_queue'], 'readwrite');
    const store = tx.objectStore('sabores');
    const id = sabor.id || crypto.randomUUID();
    const saborWithId = { ...sabor, id, sync_status: 'pending' };

    await new Promise((resolve, reject) => {
      store.add(saborWithId);
      tx.oncomplete = () => resolve(null);
      tx.onerror = () => reject(tx.error);
    });

    await this.addToSyncQueue({ type: 'sabor', action: 'add', data: saborWithId });
    return id;
  }

  async getSabores(): Promise<SaborErva[]> {
    const store = this.db!.transaction('sabores').objectStore('sabores');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<any[]> {
    const store = this.db!.transaction('sync_queue').objectStore('sync_queue');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeSyncQueueItem(id: number): Promise<void> {
    const store = this.db!.transaction('sync_queue', 'readwrite').objectStore('sync_queue');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async addToSyncQueue(item: any): Promise<void> {
    const store = this.db!.transaction('sync_queue', 'readwrite').objectStore('sync_queue');
    return new Promise((resolve, reject) => {
      const request = store.add({ ...item, timestamp: new Date().toISOString() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const idbService = new IndexedDBService();
