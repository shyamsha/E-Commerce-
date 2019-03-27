const mongoose = require("mongoose");
const { Schema } = mongoose;
const cartSchema = new Schema({
	product: {
		type: Schema.Types.ObjectId,
		ref: "Product",
		required: true
	},
	quantity: {
		type: Number,
		min: 1,
		max: 50,
		required: true
	}
});
cartSchema.pre("save", function(next) {
	// console.log("its move to order");
	next();
});
module.exports = cartSchema;
// const Cart = mongoose.model("Cart", cartSchema);
// module.exports = {
// 	Cart
// };
