import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const exist = await User.findOne({ email });
  if (exist) return res.status(400).json({ message: "User Exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, password: hashed, role });
  return res.json({
    user,
    token: generateToken(user._id.toString())
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid Email" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Wrong Password" });

  return res.json({
    user,
    token: generateToken(user._id.toString())
  });
};
