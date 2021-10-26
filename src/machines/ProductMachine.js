import { assign, createMachine, send } from "xstate";
import products from "../dummy-ds/products.json";

export const ProductMachine = createMachine({
    id: "smProductMachine",
    context: {
        data: null,
        error: null,
        query: null,
    },
    states: {
        noQuery: {
            on: {
                "SET_QUERY": { target: "hasQuery", actions: ["assignQuery"] }
            }
        },
        hasQuery: {
            entry: send({ type: "LOAD" })
        },
        loading: {
            invoke: {
                src: "runQuery",
                onDone: { target: "hasResult", actions: ["setResult"] },
                onError: { target: "hasError", actions: ["setError"] }
            }
        },
        hasResult: {},
        hasError: {}
    },
    on: {
        "LOAD": { target: "loading" }
    },
    initial: "noQuery"
}, {
    services: {
        runQuery: async (ctx, ev) => {
            const response = await fetch("http://localhost:5000/product", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    "Accept": "application/json"
                },
                body: JSON.stringify(ctx.query)
            });
            const product = await response.json();
            return [product];
        }
    },
    actions: {
        assignQuery: assign((ctx, ev) => ({ query: { id: +ev.data } })),
        setResult: assign((ctx, ev) => ({ data: ev.data })),
        setError: assign((ctx, ev) => ({ error: ev.data })),
    }
});