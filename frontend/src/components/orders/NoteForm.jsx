export default function NoteForm() {
    return (
        <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-1">Ghi chú</label>
            <textarea x-model="current.note" rows="2"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"></textarea>
        </div>

    );
}