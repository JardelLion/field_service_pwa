/** @odoo-module */

const DB_VERSION = 1;

function openDB(dbName,storeName) {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName, DB_VERSION);

        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "id" });
            }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function getAllFrom(dbName,storeName) {
    const db = await openDB(dbName,storeName);
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    return new Promise(resolve => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
    });
}

export async function getData(dbName,storeName, index) {
    const db = await openDB(dbName,storeName);
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    return new Promise(resolve => {
        const req = store.get(index);
        req.onsuccess = () => resolve(req.result || []);
    });
}



export async function saveFrom(dbName, storeName, data) {
    const db = await openDB(dbName, storeName);
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName)

    const records = Array.isArray(data) ? data : [data];
    const promises = records.map((record) => {
        return new Promise((resolve, reject) => {
            const request = store.put(record);
            request.onsuccess = () => resolve(record);
            request.onerror = (err) => reject(err);
        });
    });

    await Promise.all(promises);
    await tx.done;
}

/**
 * Deletes a single record by its ID key from the specified store.
 */
export async function deleteFrom(dbName, storeName, id) {
    const db = await openDB(dbName, storeName);
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = (err) => reject(err);
    });
}


/**
 * Updates an existing record by merging new changes into the stored object.
 *
 * @param {string} dbName - The database name
 * @param {string} storeName - The target store name
 * @param {number|string} id - The ID of the record to update
 * @param {Object} changes - Key-value pairs to update (e.g., { email: "new@email.com" })
 * @returns {Promise<Object>} The updated full record
 */
export async function update(dbName, storeName, id, changes) {
    const db = await openDB(dbName, storeName);
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const getReq = store.get(id);

        getReq.onsuccess = () => {
            const existingRecord = getReq.result;
            if (!existingRecord) {
                return reject(new Error(`Record with id ${id} not found in ${storeName}`));
            }

            // Existing _changedFields map or a new empty object
            const trackedChanges = { ...(existingRecord._changedFields || {}) };

            // Update or add modified key-value pairs (Object keys are uniquely enforced)
            Object.entries(changes).forEach(([field, value]) => {
                if (field !== '_changedFields' && field !== '_isSynced'){
                    trackedChanges[field] = value;
                }
            })

            // Merge existing record data with the update properties
            const updatedRecord = { ...existingRecord, ...changes, id, 
                _changedFields: trackedChanges,
                };

            const putReq = store.put(updatedRecord);
            putReq.onsuccess = () => resolve(updatedRecord);
            putReq.onerror = (err) => reject(err);
        };

        getReq.onerror = (err) => reject(err);
    });
}