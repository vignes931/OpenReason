export const log_info = (message: string) => {
    console.log(message)
}

export const log_error = (message: string, error?: any) => {
    console.error(message, error)
}

export const log_debug = (message: string) => {
    if (process.env.DEBUG === "true") {
        console.log(`[DEBUG] ${message}`)
    }
}
