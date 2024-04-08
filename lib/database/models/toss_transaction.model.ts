import { Schema, model, models } from "mongoose";

const TossTransactionSchema = new Schema({
    paymentKey: {
        type: String,
        required: true,
        unique: true,
    },
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    orderName: {
        type: String,
        required: true,
        // unique: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
    },
    credits: {
        type: Number,
    },
    method: {
        type: String,
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    requestedAt: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const TossTransaction = models?.TossTransaction || model("TossTransaction", TossTransactionSchema);

export default TossTransaction;