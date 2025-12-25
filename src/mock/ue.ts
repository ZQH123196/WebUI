export interface InventoryItem {
    id: string;
    name: string;
    icon: string;
    type: 'weapon' | 'consumable' | 'armor' | 'misc' | 'currency';
    slotIndex: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface InventoryData {
    capacity: number;
    items: InventoryItem[];
}

export interface UeInterface {
    isMock?: boolean;
    getalljson: () => string;
}

declare global {
    interface Window {
        ue: UeInterface;
    }
}

/**
 * Mock implementation of Unreal Engine Interface
 * This simulates the environment where the UI is running inside UE5 browser widget
 */

if (!window.ue) {
    window.ue = {
        getalljson: () => ""
    } as UeInterface;
}

// Mock Interface
window.ue.isMock = true;

// Mock Data
const MOCK_INVENTORY: InventoryData = {
    capacity: 20, // Total slots
    items: [
        { id: '1', name: 'Iron Sword', icon: '⚔️', type: 'weapon', slotIndex: 0, rarity: 'common' },
        { id: '2', name: 'Health Potion', icon: '🍷', type: 'consumable', slotIndex: 1, rarity: 'common' },
        { id: '3', name: 'Epic Shield', icon: '🛡️', type: 'armor', slotIndex: 4, rarity: 'epic' },
        { id: '4', name: 'Magic Scroll', icon: '📜', type: 'misc', slotIndex: 5, rarity: 'rare' },
        { id: '5', name: 'Gold Coins', icon: '💰', type: 'currency', slotIndex: 10, rarity: 'legendary' },
    ]
};

// Define the function that UE would normally expose
window.ue.getalljson = function () {
    console.log("[Mock] ue.getalljson() called");
    return JSON.stringify(MOCK_INVENTORY);
};

// Helper for development to log mock interactions
console.log("UE5 Mock Interface Loaded");
