
const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    token: {
        type: String,
          default: null
    },
    
    expiresAt: {
        type: Date,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
     signupToken: {
        type: String,
        default: null
    },
    signupTokenExpiresAt: {
        type: Date,
        default: null
    }
    ,resetToken: {
    type: String,
    default: null
},

resetTokenExpiresAt: {
    type: Date,
    default: null
}
});

module.exports = mongoose.model("Verification", verificationSchema);