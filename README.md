<img width="1000" alt="cover" src="https://github.com/mbeps/next_discussion_platform/assets/58662575/21829226-db49-4f91-815c-8af72ff6dacf">

---

Introducing Circus, a simple yet powerful discussion platform that enables users to engage with each other in a variety of ways. Our platform is similar to popular sites like Reddit and Quora, but with a range of unique features that set us apart.

Our platform is designed to promote engagement and collaboration among users, with a wide range of community management features that enable users to create, subscribe to, and interact with communities on a variety of topics. We also provide a range of features to make it easy for users to create and view posts, including options for images, voting, and sharing.

In addition, we provide a robust set of user authentication and account management features, ensuring that our users have a seamless and secure experience. Users can sign up using email and password or third-party authentication providers such as Google and GitHub, log in and out, reset their password, and modify their profiles.

Our platform is also designed to be user-friendly and accessible, with a responsive UI that can be used on smartphones, tablets, or computers. Whether you're an experienced user or just getting started, Circus has everything you need to engage with others and explore new ideas.

# **Requirements**
These are the requirements needed to run the project:
- Node 18 LTS
- Next.JS 12+
- Firebase V9

# **Features**
## **Authentication and Account Management**
The system has several key user authentication and account management features designed to ensure that users have a seamless and secure experience:
- Users can sign up using email and password
- Users can sign up using third-party authentication providers such as Google and GitHub
- Users can log in using email and password
- Users can log out
- Users can reset their password
- Users can modify their profiles (profile image and username)

## **Community**
The system has several key community management features designed to promote engagement and collaboration among users:
- Users can create communities (different types)
- Users can subscribe and unsubscribe to and from a community
- Admins can change or delete the community logo
- Admins can change community visibility
- Users can view and navigate to all public and restricted communities

## **Posts**
The system has several key features designed to make it easy for users to create and view posts within communities:
- Users can create a post in a specific community with an optional image
- Users can view all posts from a community
- Users can open post to interact with them
- Users can view posts from subscribed communities
- Users can delete a post they have created
- Users can vote on a post
- Users can share a post

## **Comments**
The web application has several key features designed to make it easy for users to engage with others by creating and viewing comments:
- Users can create a comment to reply to a post
- Users can view comments in a post
- Users can delete a comment they created

## **General**
The system has several general features to make the site user-friendly and accessible:
- Logged-in users can view posts from various communities they are subscribed to in the home feed
- Logged-out users can view posts from all communities in order of likes
- System UI is responsive, hence it can be used on smartphones, tablets, or computers

# **Stack**
These are the main technologies that were used in this project:

## **Front-End**
- [**TypeScript**](https://www.typescriptlang.org/): TypeScript is a superset of JavaScript that adds optional static typing and other features to make the development of large-scale JavaScript applications easier and more efficient. TypeScript enables developers to catch errors earlier in the development process, write more maintainable code, and benefit from advanced editor support.
- [**Next.js**](https://nextjs.org/): Next.js is a popular React framework for building server-side rendered (SSR) and statically generated web applications. It provides a set of tools and conventions that make it easy to build modern, performant web applications that can be easily deployed to a variety of hosting environments.
- [**Recoil State Manager**](https://recoiljs.org/): Recoil is a state management library for React applications that provides a simple, flexible, and efficient way to manage shared state in your app. Recoil is designed to work seamlessly with React and is particularly well-suited for complex or large-scale applications.
- [**Chakra UI**](https://chakra-ui.com/): Chakra UI is a popular React component library that provides a set of customizable, accessible, and responsive UI components for building web applications. Chakra UI is built with accessibility in mind and provides a range of pre-built components that can be easily customized to fit your app's design and branding.


## **Back-End**
- [**Firebase**](https://firebase.google.com/): Firebase is a mobile and web application development platform that provides a range of tools and services to help developers build high-quality apps quickly and easily. Firebase offers features such as real-time database, cloud storage, authentication, hosting, and more, all of which can be easily integrated into your Next.js app.

# **Running Application Locally**
These are simple steps to run the application locally. For more detail instructions, refer to the [Wiki](https://github.com/mbeps/next_discussion_platform/wiki). 

## 1. **Clone the Project Locally**
```sh
git clone https://github.com/mbeps/next_discussion_platform.git
```

## 2. **Set Up Environment**
1. Copy the `.env.example` file and call it `.env.local`
2. Populate the `.env.local` with the required Firebase secrets 

## 3. **Set Up Firebase**
### **Set Up Cloud Functions**
1. **Install Firebase tools**
```sh
npm install -g firebase-tools
```

2. **Initialise Firebase project**
```sh
firebase init
```

3. **Deploy cloud functions**
```sh
firebase deploy --only functions
```

### **Set Up Firestore Indexing**
Set the following indexes in the `Firestore Database` under the `Indexes` section. 
These are required for querying.

| Collection ID | Fields Indexed                                                     |
| ------------- | ------------------------------------------------------------------ |
| `posts`       | `communityId` Ascending `createdAt` Descending __name__ Descending |
| `comments`    | `postId` Ascending `createdAt` Descending __name__ Descending      |

## 3. **Run Project**
```sh
npm run dev
```
This should run the project on `localhost:3000`

# **Running via Docker**
You can build and run the application through Docker. This requires the `.env.local` file to be completed, refer to 
installation instructions in the [Wiki](https://github.com/mbeps/next_discussion_platform/wiki/3.-Installation#step-32-obtain-firebase-secrets-and-add-them-to-the-envlocal-file) for setting it up.

Once everything is ready, use the command bellow to run the application. 
```sh
docker-compose -f docker/docker-compose.yml up --build
```

# **Demo**
This video demonstrates the features and functionality of the project. 

https://user-images.githubusercontent.com/58662575/236821702-25dfb59c-162f-4de5-af8f-e0e7b8315aae.mp4

