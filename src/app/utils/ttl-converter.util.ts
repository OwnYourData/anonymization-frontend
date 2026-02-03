/**
 * TTL Converter Utility
 * Handles splitting large JSON-LD payloads and merging TTL responses
 * for conversion to Turtle format via the canonical API.
 */

/** Default maximum chunk size in bytes (100KB to stay under typical server limits) */
export const DEFAULT_CHUNK_SIZE_BYTES = 100 * 1024;

/**
 * Splits a JSON-LD object's @graph array into smaller chunks based on payload size.
 * Each chunk maintains the original @context and other root properties.
 * 
 * @param jsonLdData The JSON-LD object containing @graph array
 * @param maxChunkSizeBytes Maximum size in bytes per chunk
 * @returns Array of JSON-LD objects, each with a subset of the @graph
 */
export function splitGraphBySize(jsonLdData: any, maxChunkSizeBytes: number = DEFAULT_CHUNK_SIZE_BYTES): any[] {
    // If no @graph array, return as single chunk
    if (!jsonLdData || !jsonLdData['@graph'] || !Array.isArray(jsonLdData['@graph'])) {
        return [jsonLdData];
    }

    const graph = jsonLdData['@graph'];

    // Calculate base size (everything except @graph items)
    const baseData = { ...jsonLdData, '@graph': [] };
    const baseSize = JSON.stringify(baseData).length;

    // Check if the entire payload is small enough
    const totalSize = JSON.stringify(jsonLdData).length;
    if (totalSize <= maxChunkSizeBytes) {
        return [jsonLdData];
    }

    const chunks: any[] = [];
    let currentChunk: any[] = [];
    let currentSize = 0;

    for (const item of graph) {
        const itemSize = JSON.stringify(item).length;

        // If adding this item would exceed limit and we have items, start new chunk
        if (currentChunk.length > 0 && (baseSize + currentSize + itemSize + 2) > maxChunkSizeBytes) {
            // +2 accounts for array brackets/commas overhead
            chunks.push({ ...jsonLdData, '@graph': currentChunk });
            currentChunk = [];
            currentSize = 0;
        }

        currentChunk.push(item);
        currentSize += itemSize + 1; // +1 for comma separator
    }

    // Don't forget the last chunk
    if (currentChunk.length > 0) {
        chunks.push({ ...jsonLdData, '@graph': currentChunk });
    }

    return chunks;
}

/**
 * Merges multiple Turtle (TTL) response strings into a single TTL string.
 * Handles deduplication of @prefix declarations.
 * 
 * @param responses Array of TTL strings from separate API calls
 * @returns Merged TTL string with deduplicated prefixes
 */
export function mergeTurtleResponses(responses: string[]): string {
    if (!responses || responses.length === 0) {
        return '';
    }

    if (responses.length === 1) {
        return responses[0];
    }

    const prefixSet = new Set<string>();
    const contentParts: string[] = [];

    for (const response of responses) {
        const lines = response.split('\n');
        const nonPrefixLines: string[] = [];

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Check if this is a prefix declaration
            if (trimmedLine.startsWith('@prefix') || trimmedLine.startsWith('@base')) {
                // Add to set to deduplicate
                prefixSet.add(trimmedLine);
            } else if (trimmedLine.length > 0) {
                // Non-prefix, non-empty line - add to content
                nonPrefixLines.push(line);
            }
        }

        if (nonPrefixLines.length > 0) {
            contentParts.push(nonPrefixLines.join('\n'));
        }
    }

    // Build the merged result: prefixes first, then content
    const prefixes = Array.from(prefixSet).sort().join('\n');
    const content = contentParts.join('\n\n');

    if (prefixes && content) {
        return prefixes + '\n\n' + content;
    } else if (prefixes) {
        return prefixes;
    } else {
        return content;
    }
}

/**
 * Determines if the JSON-LD data needs to be chunked based on payload size.
 * 
 * @param jsonLdData The JSON-LD object to check
 * @param maxSizeBytes Maximum size threshold in bytes
 * @returns true if chunking is needed
 */
export function needsChunking(jsonLdData: any, maxSizeBytes: number = DEFAULT_CHUNK_SIZE_BYTES): boolean {
    if (!jsonLdData) {
        return false;
    }
    const totalSize = JSON.stringify(jsonLdData).length;
    return totalSize > maxSizeBytes;
}
