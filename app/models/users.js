const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cartSchema = require("./carts");
const monthlyCartSchema = require("./monthlycarts");
const { Schema } = mongoose;
userSchema = new Schema({
	username: {
		type: String,
		minlength: 3,
		requrired: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		validate: {
			validator: function(value) {
				return validator.isEmail(value);
			},
			message: function() {
				return "invalid email fromat";
			}
		}
	},
	password: {
		type: String,
		minlength: 8,
		requrired: true,
		validate: {
			validator: function(value) {
				validator.isEmpty(value);
			}
		}
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	tokens: [
		{
			token: {
				type: String
			}
		}
	],
	role: {
		type: [String],
		default: ["user"]
	},
	cart: [cartSchema],
	monthlyCart: [monthlyCartSchema],
	address: {
		type: Schema.Types.ObjectId,
		ref: "Address",
		required: true
	}
});
//generate password encrprition hide the original password
userSchema.pre("save", function(next) {
	if (this.isNew) {
		bcryptjs.genSalt(10).then(salt => {
			bcryptjs.hash(this.password, salt).then(hashpassword => {
				this.password = hashpassword;
				next();
			});
		});
	} else {
		next();
	}
});
//checking email and password correct or not written by user
userSchema.statics.findByCredentials = function(email, password) {
	return User.findOne({ email })
		.then(user => {
			if (user) {
				return bcryptjs
					.compare(password, user.password)
					.then(result => {
						if (result) {
							return Promise.resolve(user);
						} else {
							return Promise.reject("invalid email or password");
						}
					})
					.catch(err => {
						return Promise.reject(err);
					});
			} else {
				return Promise.reject("invalid email or password");
			}
		})
		.catch(err => {
			return Promise.reject(err);
		});
};
//generate by token while user login
userSchema.methods.generateByToken = function() {
	user = this; //reffering the user object in side User model
	const userid = {
		user_id: user._id
	};

	const token = jwt.sign(userid, "9849084994");

	user.tokens.push({ token });
	return user
		.save()
		.then(user => {
			return token;
		})
		.catch(err => {
			return err;
		});
};
userSchema.statics.findByToken = function(token) {
	let tokenData;
	try {
		tokenData = jwt.verify(token, "9849084994");
	} catch (err) {
		return Promise.reject(err);
	}

	return User.findOne({
		_id: tokenData.user_id,
		"tokens.token": token //chekin form db delete or present
	})
		.then(user => {
			return Promise.resolve(user);
		})
		.catch(err => {
			return Promise.reject(err);
		});
};
const User = mongoose.model("User", userSchema);
module.exports = {
	User
};
