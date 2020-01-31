# Email Verification Test (Full Local Auth)

This is a fully fledged local auth test done using MongoDB, mongoose, passport, passport-local, passport-local-mongoose, cookie-session, node-mailer, and crypto.

**Flow:**

```
 User gets created, verification email with link and token gets sent. If the specified email is wrong, the user can re-submit and a token and link will be sent to the new email. If the token is expired, a new token and link will be sent to the same email, or the new email. The user can verify through manually inputing the token into a form, or by following the link which will automatically verify the account and redirect to the profile. The profile can only be seen after authentication. To change the password from the profile you can do it through a form that requires the current password and a new password. If you forgot your password, you can reset it through an email by submitting a valid email for a user. Doing this creates a token and a link that get sent to the specified email in order to reset the password.
```

## Getting Started

NodeJS required and Sendgrid Account required for email functionality. Create a .env to use the code that uses environmental variables.

### Environment Variables

You will need to add the following variables to your .env file to get full functionality. 

```
DB_URI=<yourValue>

COOKIE_KEY=<yourValue>

SENDGRID_USERNAME=<yourValue>
SENDGRID_PASSWORD=<yourValue>
```

### Installing

Run your basic installation using the package.json. 

Sendgrid

```
Create a Sendgrid account.
Add Username and Password to the .env variables

```

#### Recommended: MongoDB Atlas

If you are running an OS that is not compatible with a MongoDB local (Like me) installation or ar planning to use any test app in general over the internet, I highly recommend MongoDB Atlas. 

```
Create a MongoDB Atlas Account
Create a Project
Create a Collection
Press on Connect
    Follow the Connect Instructions
Enjoy
```

## Authors

* **Marlrus** - *Curious Creature* - [Marlrus](https://github.com/Marlrus)

## License

This project is licensed under the MIT License

## Acknowledgments

* Hat tip to anyone whose code was used
* Every package developer out there, the world would be dark and full of terrors.
* passport-local-mongoose for safely taking care of hashing, salting, and storing.
* Great 3 day sprint for something that will be very handy in my ongoing larger projects :3
