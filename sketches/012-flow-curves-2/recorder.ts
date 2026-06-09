import JSZip from 'jszip'

const CHUNK_BYTES = 400 * 1024 * 1024 // 400MB per zip

export class CanvasRecorder {
    private frames: { name: string; blob: Blob }[] = []
    private totalSize = 0
    private _isRecording = false

    start() {
        this.frames = []
        this.totalSize = 0
        this._isRecording = true
    }

    addFrame(blob: Blob) {
        if (!this._isRecording) return
        const name = `frame_${String(this.frames.length).padStart(5, '0')}.png`
        this.frames.push({ name, blob })
        this.totalSize += blob.size
    }

    async finalize(filename = 'flow-recording') {
        this._isRecording = false

        const chunks = splitIntoChunks(this.frames, CHUNK_BYTES)
        const multi = chunks.length > 1

        for (let i = 0; i < chunks.length; i++) {
            const suffix = multi ? `_part${i + 1}of${chunks.length}` : ''
            await downloadZip(chunks[i], `${filename}${suffix}.zip`)
        }

        this.frames = []
        this.totalSize = 0
    }

    get isRecording() {
        return this._isRecording
    }
}

function splitIntoChunks(
    frames: { name: string; blob: Blob }[],
    maxBytes: number,
): { name: string; blob: Blob }[][] {
    const chunks: { name: string; blob: Blob }[][] = []
    let current: { name: string; blob: Blob }[] = []
    let currentSize = 0

    for (const frame of frames) {
        if (currentSize + frame.blob.size > maxBytes && current.length > 0) {
            chunks.push(current)
            current = []
            currentSize = 0
        }
        current.push(frame)
        currentSize += frame.blob.size
    }

    if (current.length > 0) chunks.push(current)
    return chunks
}

async function downloadZip(frames: { name: string; blob: Blob }[], filename: string) {
    const zip = new JSZip()
    for (const { name, blob } of frames) {
        zip.file(name, blob)
    }
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
