import mongoose, { Schema, Model } from "mongoose";

export interface UserDoc {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string; // bcrypt hash
  kdfSaltB64: string; // per-user PBKDF2 salt (base64)
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    kdfSaltB64: { type: String, required: true },
  },
  { timestamps: true }
);

let UserModel: Model<UserDoc>;
try {
  UserModel = mongoose.model<UserDoc>("User");
} catch {
  UserModel = mongoose.model<UserDoc>("User", userSchema);
}

export default UserModel;


