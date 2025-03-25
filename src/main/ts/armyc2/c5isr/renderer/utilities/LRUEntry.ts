import { ImageInfo } from "../../renderer/utilities/ImageInfo"

//The Node class for doubly linked list
export class LRUEntry {

    public key: string;
    public value: ImageInfo;
    public next: LRUEntry;
    public prev: LRUEntry;

    public constructor(prev: LRUEntry, next: LRUEntry, key: string, value: ImageInfo) {
        this.prev = prev;
        this.next = next;
        this.key = key;
        this.value = value;
    }

}
