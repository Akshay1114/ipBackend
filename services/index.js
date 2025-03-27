import { User } from '../models/index.js';
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from 'nodemailer';
import CrewSchedule from '../models/crewSchedule.js';

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

		const generateEmployeeId = Math.floor(100000 + Math.random() * 900000);
		payload.employee_ID = generateEmployeeId;
        // Hash password
		// generate a one time password for user complex password
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let otp = '';
		let oneTpass = '';
		for (let i = 0; i < 6; i++) {
			otp += chars.charAt(Math.floor(Math.random() * chars.length));
			oneTpass += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		console.log('otp', otp)
		payload.testPass = otp;
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        otp = await bcrypt.hash(otp, salt);

		const transporter = nodemailer.createTransport({
			host: "smtp.gmail.com", 
			port: 465, // Use 587 for TLS, 465 for SSL
			secure: true, // true for 465, false for 587
			auth: {
				user: process.env.EMAIL, 
				pass: process.env.PASSWORD 
			}
		});
		

		const resetLink = `https://ip-frontend-pi.vercel.app/reset-password?email=${encodeURIComponent(payload.email)}`;

		const mailOptions = {
			from: '"Wings Wise',
			to: payload.email,
			subject: "Welcome to Wings Wise",
			text: "Hello! This is a test email sent using SMTP in Node.js.",
			html: `<h3>Hello!</h3><p> Welcome to team Here is your one time password <strong>${oneTpass}</strond>  and Your employee ID : <strong>${generateEmployeeId}</strong> here is the link to change your password ${resetLink} .</p>`
		};
		
		
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error("Error sending email:", error);
			} else {
				console.log("Email sent:", info.response);
			}
		});
		payload.password = otp;
        const user = new User(payload);
        return await user.save();
		// return otp
};

//  Login user
const loginUser = async (payload = {}) => {
	console.log('payload ==>', payload)
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email validation
   emailRegex.test(payload.email);
   let filter = payload.email
	if(!emailRegex.test(payload.email)) filter = payload.email
		console.log(filter)
	const user = await User.findOne({
		$or: [{ email: filter }, { employee_ID: filter }]
	});
	if (!user) {
		throw new Error("Invalid credentials");
	}
	console.log('User: FINDD');
	const isMatch = await bcrypt.compare(payload.password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");
        // Generate JWT Token
        const token = jwt.sign({ id: user._id, email: user.email, employee_ID:user.employee_ID }, process.env.JWT_SECRET_KEY);
		// const res
        return { token, user };
};

const changePassword = async (payload = {}) => {
	console.log("ENTER IN CHANGE PASSWORD")
	const user = await User.findOne({
		// $or: [{ email: filter }, { employee_ID: filter }]
		email: payload.email
	});
	// console.log('User:', user);
	if (!user) {
		throw new Error("Invalid credentials");
	}
	const newTPass = payload.password
	const isMatch = await bcrypt.compare(payload.oldPassword, user.password);
	console.log('isMatch:', isMatch);
	if (!isMatch) throw new Error("Invalid credentials");
	const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
	payload.password = await bcrypt.hash(payload.password, salt);
	const result = await User.updateOne(
		{ email: payload.email }, 
		{ $set: { password: payload.password, testPass: newTPass} } // Update the password field
	);
	return "Password changed successfully";
}

const getCrewSchedule = async (payload = {}) => {
	// const crewData = await CrewSchedule.find(
	// 	{ employee_ID: payload }
	// );
	const crewData = await CrewSchedule.aggregate([
		{
		  $match: { employee_ID: payload } // Find crew schedules for the given employee
		},
		{
		  $lookup: {
			from: "flightschedules", // Collection name in MongoDB
			localField: "assignedFlights", // Field in CrewSchedule (array)
			foreignField: "flightId", // Field in FlightSchedule
			as: "flightDetails" // Name of the joined data
		  }
		}
	  ]);
	return crewData;	
}

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
	 deleteUser, findAllUsers, getUsersCount, changeStatus, updateDeviceToken, loginUser, changePassword, getCrewSchedule };
