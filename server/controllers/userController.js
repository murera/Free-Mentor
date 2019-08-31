/* eslint-disable class-methods-use-this */
import Joi from 'joi';
import User from '../models/userModel';
import status from '../helpers/StatusCode';


class UserController {
    signUp = (req, res) => {
      // validation using JOI npm
      const schema = {
        first_name: Joi.string().alphanum().required(),
        last_name: Joi.string().alphanum().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        address: Joi.string().required(),
        bio: Joi.string().required(),
        occupation: Joi.string().required(),
        expertise: Joi.string().required(),
        is_mentor: Joi.boolean().default(false),
        is_admin: Joi.boolean().default(false),
      };
      const result = Joi.validate(req.body, schema);
      if (result.error == null) {
        if (User.isEmailTaken(req.body.email)) {
          // 409 = Conflict due to existing email
          return res.status(status.REQUEST_CONFLICT).send({ status: status.REQUEST_CONFLICT, error: `${req.body.email} already exists` });
        }

        const user = User.create(req.body);
        return res.status(status.RESOURCE_CREATED).send(user);
      }
      return res.status(400).send({ status: 400, error: `${result.error.details[0].message}` });
    };

    signIn = (req, res) => {
      // validation using JOI package from npm registry
      const schema = {
        email: Joi.string().email().required(),
        password: Joi.required(),
      };
      const result = Joi.validate(req.body, schema);
      if (result.error == null) {
      // Everything is okay
        // We fire up User model to login user
        const user = User.login(req.body);
        if (user.status === status.REQUEST_SUCCEDED) {
          res.set('x-auth-token', user.data.token);
          return res.status(status.REQUEST_SUCCEDED).send(user);
        }

        return res.status(status.UNAUTHORIZED).send(user);
      }
      return res.status(status.BAD_REQUEST).send({ status: status.BAD_REQUEST, error: `${result.error.details[0].message}` });
    };
    // restrict to admin
    // eslint-disable-next-line lines-between-class-members
    GetAllUsers(req, res) {
      const allusers = User.users;
      if (allusers.length <= 0) {
        return res.status(404).send({
          status: 404,
          message: 'No users found',
        });
      }
      return res.status(200).send({
        status: 200,
        data: allusers,
      });
    }

    GetSpecificUser(req, res) {
      const singleUser = User.users.find((user) => user.id == req.params.id);
      if (!singleUser) {
        return res.status(404).send({
          status: 404,
          error: 'User not found',
        });
      }
      return res.status(200).send({
        status: 200,
        data: singleUser,
      });
    }

    ChangeToMentor(req, res) {
      const currentUser = User.users.find((user) => user.id == req.params.id);
      if (!currentUser) {
        return res.status(404).send({
          status: 404,
          error: 'User not found',
        });
      }
      if (currentUser.is_mentor === true) {
        return res.status(400).send({ status: 400, error: 'User is already a mentor' });
      }
      currentUser.is_mentor = req.body.is_mentor;

      return res.status(202).send({
        status: 202,
        data: currentUser,
      });
    }

    deleteUser(req, res) {
      const currentuserUser = User.users.find((user) => user.id == req.params.id);
      if (!currentuserUser) {
        return res.status(404).send({
          status: 404,
          error: 'Not Found',
        });
      }
      const indexOfCurrentuserUser = User.users.indexOf(currentuserUser);
      if (indexOfCurrentuserUser > -1) {
        const removeOne = User.users.splice(indexOfCurrentuserUser, 1);
        if (removeOne) {
          return res.status(200).send({
            status: 200,
            message: 'Successfully Deleted a User',
          });
        }
      }

      return res.status(400).send({
        status: 400,
        err: 'Unable to delete',
      });
    }

    getAllMentors(req, res) {
      const allMentors = User.users.filter((user) => user.is_mentor == true);
      if (allMentors.length < 1) {
        return res.status(404).send({
          status: 404,
          message: 'mentors are not available',
        });
      }

      return res.status(200).send({
        status: 200,
        data: allMentors,
      });
    }

    GetOneMentor(req, res) {
      const allMentors = User.users.filter((user) => user.is_mentor == true);
      if (allMentors.length < 1) {
        return res.status(404).send({
          status: 404,
          message: 'mentors are not available',
        });
      }

      const specificMentor = allMentors.find((user) => user.id == req.params.id);
      if (!specificMentor) {
        return res.status(404).send({
          status: 404,
          error: 'No mentor found',
        });
      }
      return res.status(200).send({
        status: 200,
        data: specificMentor,
      });
    }
}
export default UserController;
