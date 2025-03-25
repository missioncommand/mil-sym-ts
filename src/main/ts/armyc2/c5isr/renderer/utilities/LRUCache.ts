import { type int } from "../../graphics2d/BasicTypes";
import { ImageInfo } from "../../renderer/utilities/ImageInfo"
import { LRUEntry } from "../../renderer/utilities/LRUEntry"



/**
 * Modified LRUCache implementation from: https://techblogstation.com/java/lru-cache-implementation-in-java/
 * and
 * https://www.baeldung.com/java-lru-cache
 */


//The class for LRU Cache storage and its operations
export class LRUCache {

        // Variable to store the least recently used element
        private lruElement: LRUEntry;

        // Variable to store the most recently used element
        private mruElement: LRUEntry;

        private container: Map<string, LRUEntry>;
        private capacity: int = 0;
        private currentSize: int = 0;

        //private readonly lock: java.util.concurrent.locks.ReentrantReadWriteLock = new java.util.concurrent.locks.ReentrantReadWriteLock();

        // Constructor for setting the values in instance variables
        public constructor(capacity: int) {
                this.capacity = capacity;
                this.currentSize = 0;
                this.lruElement = new LRUEntry(null, null, null, null);
                this.mruElement = this.lruElement;
                this.container = new Map<string, LRUEntry>();
        }

        // The get method to perform the retrieve operations on data
        public get(key: string): ImageInfo | null {
                //this.lock.readLock().lock();
                try {
                        let tempLRUEntry: LRUEntry = this.container.get(key);
                        if (tempLRUEntry == null) {
                                return null;
                        }
                        // In case the MRU leave the list as it is :
                        else {
                                if (tempLRUEntry.key === this.mruElement.key) {
                                        return this.mruElement.value;
                                }
                        }


                        // Getting the Next and Previous Nodes
                        let nextLRUEntry: LRUEntry = tempLRUEntry.next;
                        let prevLRUEntry: LRUEntry = tempLRUEntry.prev;

                        // If LRU is updated at the left-most
                        if (tempLRUEntry.key === this.lruElement.key) {
                                nextLRUEntry.prev = null;
                                this.lruElement = nextLRUEntry;
                        }

                        // In case we are in the middle, we are required to update the items before and
                        // after our item
                        else {
                                if (tempLRUEntry.key !== this.mruElement.key) {
                                        prevLRUEntry.next = nextLRUEntry;
                                        nextLRUEntry.prev = prevLRUEntry;
                                }
                        }


                        // And here we are finally moving our item to MRU
                        tempLRUEntry.prev = this.mruElement;
                        this.mruElement.next = tempLRUEntry;
                        this.mruElement = tempLRUEntry;
                        this.mruElement.next = null;

                        return tempLRUEntry.value;
                }
                finally {
                       // this.lock.readLock().unlock();
                }

        }

        // The put method to perform the insert operations on cache

        public put(key: string, value: ImageInfo): void {
                //this.lock.writeLock().lock();
                try {
                        if (this.container.has(key)) {
                                return;
                        }

                        // Inserting the new Node at the right-most end position of the linked-list
                        let myLRUEntry: LRUEntry = new LRUEntry(this.mruElement, null, key, value);
                        this.mruElement.next = myLRUEntry;
                        this.container.set(key, myLRUEntry);
                        this.mruElement = myLRUEntry;

                        // Deleting the entry of position left-most of LRU cache and also updating the
                        // LRU pointer
                        if (this.currentSize === this.capacity) {
                                this.container.delete(this.lruElement.key);
                                this.lruElement = this.lruElement.next;
                                this.lruElement.prev = null;
                        }

                        // Updating the size of container for the firstly added entry and updating the
                        // LRU pointer
                        else {
                                if (this.currentSize < this.capacity) {
                                        if (this.currentSize === 0) {
                                                this.lruElement = myLRUEntry;
                                        }
                                        this.currentSize++;
                                }
                        }

                }
                finally {
                        //this.lock.writeLock().unlock();
                }
        }
}
