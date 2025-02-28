import { Router } from 'express';
import { makeResponse, responseMessages, statusCodes } from '../helpers/response/index.js';
import {
  addUser,
  deleteUser,
  findAllUsers,
  findUserById,
  getUsersCount,
  loginUser,
  updateUser
} from '../services/index.js';


const router = Router();

//Response messages
const { USER_ADDED, FETCH_USERS, UPDATE_USER, ALREADY_REGISTER, FETCH_USER, DELETE_USER,LOGIN } = responseMessages.EN;
//Response Status code
const { RECORD_CREATED, RECORD_ALREADY_EXISTS, SUCCESS, BAD_REQUEST } = statusCodes;



//Add User
router.post('/signup', async(req, res) => {
  console.log("ENTER HERE IN SIGNUP")
  addUser(req.body)
            .then(async user => {
              return makeResponse(
                res,
                RECORD_CREATED,
                true,
                USER_ADDED,
                user
              );
            })
            .catch(async error => {
              return makeResponse(
                res,
                RECORD_ALREADY_EXISTS,
                false,
                error.message
              );
            });
 
});

// Login User
router.post('/login', async (req, res) => {
  console.log("ENTER HERE IN LOGIN")
    try{
      console.log(req.body)
      loginUser(req.body)
      .then(async user => {
        return makeResponse(
          res,
          RECORD_CREATED,
          true,
          LOGIN,
          user
        );
      })
      .catch(async error => {
        return makeResponse(
          res,
          RECORD_ALREADY_EXISTS,
          false,
          error.message
        );
      });
    } catch (error) {
      return makeResponse(
        res,
        RECORD_ALREADY_EXISTS,
        false,
        error.message
      );
    }
  
});


//Update user
router.put("/:id", (req, res) => {
  const { id } = req.params;
  updateUser(id, req.body)
    .then(async (user) => {
      return makeResponse(
        res,
        SUCCESS,
        true,
        UPDATE_USER,
        user
      );
    })
    .catch(async (error) => {
      return makeResponse(
        res,
        BAD_REQUEST,
        false, error.message);
    });
});

//Get user by Id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  findUserById({ _id: id })
    .then(user => {
      return makeResponse(
        res,
        SUCCESS,
        true,
        FETCH_USER,
        user
      );
    })
    .catch(async (error) => {
      return makeResponse(
        res,
        BAD_REQUEST,
        false, error.message
      );
    });
});


//Find all user
router.get("/", (req, res) => {

  let page = 1, limit = 10, skip = 0
  let regx = new RegExp(req.query.search ? req.query.search : '')
  if (req.query.page) page = req.query.page
  if (req.query.limit) limit = req.query.limit
  skip = (page - 1) * limit

  //created common searching object for find all user and user count
  let searchingUser = {
    isDeleted: false, $or: [{ 'name': { '$regex': regx, $options: 'i' } },
    { 'mobile': regx }]
  }

  findAllUsers(searchingUser, parseInt(skip), parseInt(limit))
    .then(async (user) => {
      let userCount = await getUsersCount(searchingUser);
      return makeResponse(
        res,
        SUCCESS,
        true,
        FETCH_USERS, user, {
        current_page: page,
        total_records: userCount,
        total_pages: Math.ceil(userCount / limit)
      });
    })
    .catch(async (error) => {
      return makeResponse(
        res,
        BAD_REQUEST,
        false, error.message);
    });
});

//Delete User
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  console.log('id', id)
  res.send('Hello World')
  // deleteUser(id)
  //   .then(async () => {
  //     return makeResponse(
  //       res,
  //       SUCCESS,
  //       true,
  //       DELETE_USER
  //     );
  //   })
  //   .catch(async (error) => {
  //     return makeResponse(
  //       res,
  //       BAD_REQUEST,
  //       false, error.message);
  //   });
});


export const userController = router;
