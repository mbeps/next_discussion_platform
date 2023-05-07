This directory is dedicated to managing the configuration and setup of Firebase services for the application. It aims to provide a well-structured and organized approach for integrating Firebase into the project. 

## **Files**
### **Configuration: `clientApp.ts`**
Initialises the Firebase application and provide instances of the required Firebase services for use throughout the application. The Firebase services that are initialised are:
- **Firebase Authentication**: provides authentication services to the site.
- **Firestore Database**: provides a non-relational database to the site for storing data (such as users, communities, posts, etc)
- **Firebase Storage**: provides a storage place for assets such as files, pictures, etc. This is used for storing images that are added to posts. 

### **Error Messages: `errors.ts`**
Maps default Firebase error messages to more user-friendly messages. This helps create a more consistent and easily understandable error reporting system for the end-user. By maintaining these error messages in a separate file, it allows for easy updates and maintenance of error messages without affecting other parts of the Firebase configuration. Some of the errors are mapped to the same error massage for security purposes. 

The main errors that are mapped are:
- Email already in use
- Invalid email or password