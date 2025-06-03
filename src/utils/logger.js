export async function logger(debug = false,...logContent) {
  if (debug) {
    console.log(...logContent)
  }
}