"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioRecordStorage = void 0;
class AudioRecordStorage {
    static save(record) {
        this.records.set(record.id, record);
    }
    static findById(id) {
        return this.records.get(id);
    }
    static update(id, updates) {
        const record = this.records.get(id);
        if (record) {
            const updatedRecord = { ...record, ...updates };
            this.records.set(id, updatedRecord);
            return updatedRecord;
        }
        return undefined;
    }
    static getAll() {
        return Array.from(this.records.values());
    }
    static delete(id) {
        return this.records.delete(id);
    }
}
exports.AudioRecordStorage = AudioRecordStorage;
AudioRecordStorage.records = new Map();
//# sourceMappingURL=audioRecord.js.map