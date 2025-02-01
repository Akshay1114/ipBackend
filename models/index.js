import mongoose from "mongoose";

const userSchema = mongoose.Schema({

  name: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
}
);
const User = mongoose.model('User', userSchema);

export { User };