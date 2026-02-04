"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultParser = void 0;
exports.getResultParser = getResultParser;
exports.resetResultParser = resetResultParser;
class ResultParser {
    // Main parse method - tries multiple strategies
    parse(content, original, sourceLang, targetLang, provider, model, duration, options = {}) {
        // Try JSON parsing first
        const jsonResult = this.tryParseJson(content);
        if (jsonResult) {
            return this.buildResult(jsonResult, original, sourceLang, targetLang, provider, model, duration, content);
        }
        // Try Markdown parsing
        const markdownResult = this.tryParseMarkdown(content);
        if (markdownResult) {
            return this.buildResult(markdownResult, original, sourceLang, targetLang, provider, model, duration, content);
        }
        // Fallback to plain text
        return this.buildResult({ translation: content.trim() }, original, sourceLang, targetLang, provider, model, duration, content);
    }
    // Try to parse JSON from content
    tryParseJson(content) {
        try {
            // Strategy 1: Direct JSON parse
            try {
                const parsed = JSON.parse(content.trim());
                return this.normalizeResult(parsed);
            }
            catch {
                // Continue to next strategy
            }
            // Strategy 2: Extract JSON from markdown code block
            const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
            if (codeBlockMatch) {
                const parsed = JSON.parse(codeBlockMatch[1].trim());
                return this.normalizeResult(parsed);
            }
            // Strategy 3: Extract JSON from text (find first { and last })
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return this.normalizeResult(parsed);
            }
            return null;
        }
        catch {
            return null;
        }
    }
    // Try to parse Markdown format
    tryParseMarkdown(content) {
        const result = {};
        // Extract translation (usually the first non-empty line or a header)
        const lines = content.split('\n').filter(l => l.trim());
        if (lines.length === 0)
            return null;
        // Look for "翻译" or "Translation" section
        const translationMatch = content.match(/(?:翻译|Translation)[：:]\s*\n?\s*([^\n]+)/i);
        if (translationMatch) {
            result.translation = translationMatch[1].trim();
        }
        else {
            // Use first line as translation
            result.translation = lines[0].replace(/^#+\s*/, '').trim();
        }
        // Extract pronunciation
        const pronunciationMatch = content.match(/(?:发音|Pronunciation)[：:]\s*\/([^\/]+)\//i);
        if (pronunciationMatch) {
            result.pronunciation = `/${pronunciationMatch[1]}/`;
        }
        // Extract alternatives
        const alternativesMatch = content.match(/(?:替代翻译|Alternatives)[：:]\s*\n?([^#]+)(?:\n#|$)/i);
        if (alternativesMatch) {
            result.alternatives = alternativesMatch[1]
                .split(/[\n,，]/)
                .map(s => s.trim())
                .filter(s => s && !s.startsWith('-'));
        }
        // Extract explanations (bullet points)
        const explanations = [];
        const explanationMatch = content.match(/(?:词汇|Explanations)[：:]\s*\n?([\s\S]*?)(?:\n#|$)/i);
        if (explanationMatch) {
            const lines = explanationMatch[1].split('\n');
            for (const line of lines) {
                const match = line.match(/^[-*]\s*(\w+)[\s\/]*([^:]+)[:：]\s*(.+)$/);
                if (match) {
                    explanations.push({
                        word: match[1].trim(),
                        pronunciation: match[2].trim() || undefined,
                        meaning: match[3].trim(),
                    });
                }
            }
        }
        if (explanations.length > 0) {
            result.explanations = explanations;
        }
        // Extract examples
        const examples = [];
        const exampleMatch = content.match(/(?:例句|Examples)[：:]\s*\n?([\s\S]*?)(?:\n#|$)/i);
        if (exampleMatch) {
            const lines = exampleMatch[1].split('\n');
            for (let i = 0; i < lines.length - 1; i += 2) {
                const original = lines[i].replace(/^[-*]\s*/, '').trim();
                const translation = lines[i + 1]?.replace(/^[-*]\s*/, '').trim();
                if (original && translation) {
                    examples.push({ source: original, target: translation, original, translation });
                }
            }
        }
        if (examples.length > 0) {
            result.examples = examples;
        }
        return result.translation ? result : null;
    }
    // Normalize parsed result to ensure required fields
    normalizeResult(parsed) {
        const result = {};
        // Handle different field names
        result.translation = parsed.translation ||
            parsed.translatedText ||
            parsed.result ||
            parsed.text ||
            (typeof parsed === 'string' ? parsed : undefined);
        result.pronunciation = parsed.pronunciation || parsed.phonetic || undefined;
        result.alternatives = Array.isArray(parsed.alternatives)
            ? parsed.alternatives
            : undefined;
        result.explanations = Array.isArray(parsed.explanations)
            ? parsed.explanations.map((e) => ({
                word: e.word || e.term || '',
                meaning: e.meaning || e.definition || '',
                pronunciation: e.pronunciation,
                pos: e.pos || e.partOfSpeech,
            }))
            : undefined;
        result.examples = Array.isArray(parsed.examples)
            ? parsed.examples.map((e) => ({
                original: e.original || e.source || '',
                translation: e.translation || e.target || '',
            }))
            : undefined;
        return result;
    }
    // Build final TranslationResult
    buildResult(partial, original, sourceLang, targetLang, provider, model, duration, raw) {
        return {
            original,
            translation: partial.translation || '翻译失败：无法解析结果',
            pronunciation: partial.pronunciation,
            alternatives: partial.alternatives || [],
            explanations: partial.explanations,
            examples: partial.examples,
            sourceLang,
            targetLang,
            provider,
            model,
            duration,
            raw,
        };
    }
    // Detect format of content
    detectFormat(content) {
        const trimmed = content.trim();
        // Check for JSON
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            return 'json';
        }
        // Check for JSON in code block
        if (trimmed.includes('```json') || trimmed.includes('```\n{')) {
            return 'json';
        }
        // Check for Markdown headers
        if (/^#{1,6}\s/.test(trimmed) || /\n#{1,6}\s/.test(trimmed)) {
            return 'markdown';
        }
        // Check for Markdown-style sections
        if (/\*\*|__|[-*]\s/.test(trimmed)) {
            return 'markdown';
        }
        return 'plain';
    }
}
exports.ResultParser = ResultParser;
// Singleton instance
let parser;
function getResultParser() {
    if (!parser) {
        parser = new ResultParser();
    }
    return parser;
}
function resetResultParser() {
    parser = undefined;
}
//# sourceMappingURL=parser.js.map