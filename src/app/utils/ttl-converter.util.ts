/**
 * TTL Converter Utility
 * Handles splitting large JSON-LD payloads and merging TTL responses
 * for conversion to Turtle format via the canonical API.
 */

/** Default number of @graph items per chunk */
export const DEFAULT_CHUNK_SIZE = 50;

/**
 * Splits a JSON-LD object's @graph array into smaller chunks.
 * Each chunk maintains the original @context and other root properties.
 * 
 * @param jsonLdData The JSON-LD object containing @graph array
 * @param chunkSize Maximum number of items per chunk
 * @returns Array of JSON-LD objects, each with a subset of the @graph
 */
export function splitGraphIntoChunks(jsonLdData: any, chunkSize: number = DEFAULT_CHUNK_SIZE): any[] {
    // If no @graph array or it's small enough, return as single chunk
    if (!jsonLdData || !jsonLdData['@graph'] || !Array.isArray(jsonLdData['@graph'])) {
        return [jsonLdData];
    }

    const graph = jsonLdData['@graph'];
    
    // If graph is small enough, no need to split
    if (graph.length <= chunkSize) {
        return [jsonLdData];
    }

    const chunks: any[] = [];
    
    for (let i = 0; i < graph.length; i += chunkSize) {
        const graphChunk = graph.slice(i, i + chunkSize);
        
        // Create a new JSON-LD object with the chunked graph
        // Preserve all root properties except @graph
        const chunkData: any = {};
        
        for (const key of Object.keys(jsonLdData)) {
            if (key === '@graph') {
                chunkData['@graph'] = graphChunk;
            } else {
                chunkData[key] = jsonLdData[key];
            }
        }
        
        chunks.push(chunkData);
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
 * Determines if the JSON-LD data needs to be chunked based on @graph size.
 * 
 * @param jsonLdData The JSON-LD object to check
 * @param threshold Minimum @graph size that triggers chunking
 * @returns true if chunking is needed
 */
export function needsChunking(jsonLdData: any, threshold: number = DEFAULT_CHUNK_SIZE): boolean {
    if (!jsonLdData || !jsonLdData['@graph'] || !Array.isArray(jsonLdData['@graph'])) {
        return false;
    }
    return jsonLdData['@graph'].length > threshold;
}
