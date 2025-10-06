import mongoose, { Schema, Model } from "mongoose";

export interface EncryptedField {
  ivB64: string; // AES-GCM IV
  ctB64: string; // ciphertext (includes tag within ct for webcrypto)
}

export interface VaultItemDoc {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title?: EncryptedField;
  username?: EncryptedField;
  password?: EncryptedField;
  url?: EncryptedField;
  notes?: EncryptedField;
  tags?: string[]; // plaintext tags optional
  createdAt: Date;
  updatedAt: Date;
}

const encryptedFieldSchema = new Schema<EncryptedField>(
  {
    ivB64: { type: String, required: true },
    ctB64: { type: String, required: true },
  },
  { _id: false }
);

const vaultItemSchema = new Schema<VaultItemDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: encryptedFieldSchema, required: false },
    username: { type: encryptedFieldSchema, required: false },
    password: { type: encryptedFieldSchema, required: false },
    url: { type: encryptedFieldSchema, required: false },
    notes: { type: encryptedFieldSchema, required: false },
    tags: { type: [String], required: false, index: true },
  },
  { timestamps: true }
);

let VaultItemModel: Model<VaultItemDoc>;
try {
  VaultItemModel = mongoose.model<VaultItemDoc>("VaultItem");
} catch {
  VaultItemModel = mongoose.model<VaultItemDoc>("VaultItem", vaultItemSchema);
}

export default VaultItemModel;


