import { delay } from "./delay";

export class RequestQueue {
    private queue: any[] = [];
    private processing: boolean = false;
    private rateLimitMS: number;

    constructor(rateLimitMS: number = 200){
        this.rateLimitMS = rateLimitMS;    
    }

    async add(request: Function): Promise<any> {
        return new Promise((resolve, reject) => {
            this.queue.push({request, resolve, reject});
            if (!this.processing)   this.processQueue();
        });
    }

    private async processQueue() {
        if(this.processing) return;
        this.processing = true;

        while(this.queue.length > 0) {
            const {request, resolve, reject} = this.queue.shift()!;
            try {
                const result = await request();
                resolve(result);
            }catch(error: any) {
                reject(error);
            }
            await delay(this.rateLimitMS);
        }
        this.processing = false;
    }
}

export const apiQueue = new RequestQueue(200);