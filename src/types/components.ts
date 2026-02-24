export interface StreamState {
    status: "idle" | "streaming" | "done" | "error";
    text: string;
    error?: string;
}
