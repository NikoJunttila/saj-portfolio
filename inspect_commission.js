import { pb } from './src/lib/pocketbase.js';

async function inspect() {
    try {
        const result = await pb.collection('commissions').getList(1, 1);
        if (result.items.length > 0) {
            console.log('Commission keys:', Object.keys(result.items[0]));
            console.log('Sample commission:', result.items[0]);
        } else {
            console.log('No commissions found.');
        }
    } catch (e) {
        console.error(e);
    }
}

inspect();
