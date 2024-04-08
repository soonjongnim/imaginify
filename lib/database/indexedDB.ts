import { openDB } from 'idb';

interface CartItem {
    id: number;
    plan: string;
    amount: number;
    credits: number;
    buyerId: string;
    orderId?: string; // Add orderId field
}

export async function addDB({
    plan,
    amount,
    credits,
    buyerId,
}: {
    plan: string;
    amount: number;
    credits: number;
    buyerId: string;
}) {
    const db = await openDB("DB", 1, {
        upgrade(db) {
            const store = db.createObjectStore("cart", {
                keyPath: "id",
            });
            store.createIndex("buyerId", "buyerId"); // Create index on buyerId
            store.createIndex("orderId", "orderId"); // Create index on orderId
        },
    });

    await db
        .transaction("cart", "readwrite")
        .objectStore("cart")
        .add({
            id: new Date().getTime(), // You can use a timestamp as a unique key
            plan: plan,
            amount: amount,
            credits: credits,
            buyerId: buyerId,
            orderId: "",
        });
}

export async function getDB(buyerId: string, orderId?: string | null) {
    const db = await openDB("DB", 1);

    const transaction = db.transaction("cart", "readonly");
    const objectStore = transaction.objectStore("cart");

    let index;
    let searchKey;
    
    if (orderId && orderId.trim() !== "") {
        console.log('getDB orderId: ', orderId)
        // If orderId is not empty, search by orderId
        index = objectStore.index("orderId");
        searchKey = orderId;
    } else {
        console.log('getDB buyerId: ' , buyerId)
        // Otherwise, search by buyerId
        index = objectStore.index("buyerId");
        searchKey = buyerId;
    }

    // Retrieve data using the index
    const request = index.getAll(searchKey);

    // Return the retrieved data
    const result = await request;

    return result;
}

export async function updateDB(buyerId: string, orderId: string) {
    const db = await openDB("DB", 1);

    const transaction = db.transaction("cart", "readwrite");
    const objectStore = transaction.objectStore("cart");

    // Open the index on buyerId
    const index = objectStore.index("buyerId");

    // Retrieve data using the index
    const request = index.getAll(buyerId);

    // Update entries with orderId
    const cartItems: CartItem[] = await request;
    cartItems.forEach(cartItem => {
        // Update orderId
        cartItem.orderId = orderId;
        // Put the updated entry back into the object store
        objectStore.put(cartItem);
    });

    await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

export async function deleteDB(buyerId: string, orderId: string) {
    try {
        const db = await openDB("DB", 1);

        const transaction = db.transaction("cart", "readwrite");
        const objectStore = transaction.objectStore("cart");

        let index;
        let searchKey;
        
        if (orderId && orderId.trim() !== "") {
            console.log('deleteDB orderId: ', orderId)
            // If orderId is not empty, search by orderId
            index = objectStore.index("orderId");
            searchKey = orderId;
        } else {
            console.log('deleteDB buyerId: ' , buyerId)
            // Otherwise, search by buyerId
            index = objectStore.index("buyerId");
            searchKey = buyerId;
        }
        
        // Open the index on buyerId
        // const index = objectStore.index("buyerId");

        // Retrieve keys using the index
        const request = index.getAllKeys(searchKey);

        // Delete entries using retrieved keys
        const keys = await request;
        keys.forEach(key => {
            objectStore.delete(key);
        });

        return new Promise<void>((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.log(error);
    }
}