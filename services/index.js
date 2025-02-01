import { User } from '../models/index.js';


///Add user
const addUser = async (payload = {}) => {
  let user = new User(payload);
  return user.save();
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
	 deleteUser, findAllUsers, getUsersCount, changeStatus, updateDeviceToken };
