import type { RequestOptions, RequestResponse } from "../config/types";
import { group } from "../utils/Logger";

export const request = async (
    url: string,
    options: RequestOptions = { method: "GET" }
): Promise<RequestResponse> => {
    if (options.method === "GET" && options.body) {
        delete options.body;
    }

    try {
        const response = await fetch(url, options);
        const body = await response.text();

        if (response.status !== 200) {
            group(`Response ${response.status}`, url, body);
        }

        return {
            success: response.status === 200,
            response: body,
            statusText: response.statusText,
        };
    } catch (err) {
        group("Request failed", url, err);
        return {
            success: false,
            response: err instanceof Error ? err.message : String(err),
            statusText: "ERROR",
        };
    }
};
