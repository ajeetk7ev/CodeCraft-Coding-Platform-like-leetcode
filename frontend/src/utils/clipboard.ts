
/**
 * Copies text to the clipboard, handling both secure and non-secure contexts.
 * 
 * Uses navigator.clipboard API if available (secure contexts).
 * Falls back to document.execCommand('copy') for non-secure contexts (HTTP).
 * 
 * @param text The text to copy
 * @returns Promise<boolean> indicating success
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!text) return false;

    // Try modern Clipboard API first (only works in Secure Contexts like HTTPS or localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn("Clipboard API failed, falling back to execCommand", err);
            // Fall through to fallback mechanism
        }
    }

    // Fallback: document.execCommand('copy')
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Ensure it's not visible but part of the DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        return successful;
    } catch (err) {
        console.error("Fallback copy failed", err);
        return false;
    }
};
