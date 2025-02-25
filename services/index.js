import { User } from '../models/index.js';
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


const SALT_WORK_FACTOR = 10;
///Add user
const addUser = async (payload = {}) => {
	console.log('payload', payload)
	const existingUser = await User.findOne({ email: payload.email });
        console.log('Existing User:', existingUser);
        if (existingUser) {
            throw new Error("Email already in use");
        }

        // Hash password
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        payload.password = await bcrypt.hash(payload.password, salt);

        // Create new user
        const user = new User(payload);
        return await user.save();
};

//  Login user
const loginUser = async (payload = {}) => {
	console.log('payload', payload)
	console.log('process.env.JWT_SECRET_KEY', process.env.JWT_SECRET_KEY)
	const user = await User.findOne({
		email: payload.email
	});
	console.log('User:', user);
	if (!user) {
		throw new Error("Invalid credentials");
	}
	const isMatch = await bcrypt.compare(payload.password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET_KEY);
		// const res
        return { token, user };
};

//Find user detail
const findUserById = (search = {}) => new Promise((resolve, reject) => {
	User.findOne(search)
	  .then(resolve)
		.catch(reject)
})

//Update user
const updateUser = (_id, data) => new Promise((resolve, reject) => {
	User.updateOne({ _id: _id }, data)
    .then(resolve)
    .catch(reject);
});

//Delete user
const deleteUser = (id) => new Promise((resolve, reject) => {
	User.updateMany({ _id: { $in: id } }, { $set: { isDeleted: true } })
		.then(resolve)
		.catch(reject)
})

//Find all users
const findAllUsers = (search = {}, skip, limit) => new Promise((resolve, reject) => {
	User.find(search)
		.skip(skip).limit(limit)
		.sort('-createdAt')
		.then(resolve)
		.catch(reject)
})

//Get count
const getUsersCount = (search) => new Promise((resolve, reject) => {
	User.count(search)
		.then(resolve)
		.catch(reject)
})

//Change status
const changeStatus = (_id, data) => new Promise((resolve, reject) => {
	User.updateOne({ _id: _id }, data)
    .then(resolve)
    .catch(reject);
});

//Update device token
const updateDeviceToken = (_id, data) => new Promise((resolve, reject) => {
	User.findOneAndUpdate({ _id: _id }, { $set: data })
		.then(resolve)
		.catch(reject);
});

export { addUser, findUserById, updateUser,
	 deleteUser, findAllUsers, getUsersCount, changeStatus, updateDeviceToken, loginUser };
