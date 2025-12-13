import { serve } from "inngest/express";
import { inngest, functions } from "../server/inngest/index.js";

console.log("🔥 INNGEST API FILE LOADED");
console.log(
    "🔥 FUNCTIONS:",
    functions.map(f => f.id)
);
export default serve({
    client: inngest,
    functions,
});
