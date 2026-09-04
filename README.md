# **Circus Discussions**
*Forum Discussions Web Application*

<img width="1000" alt="cover" src="https://github.com/mbeps/next_discussion_platform/assets/58662575/21829226-db49-4f91-815c-8af72ff6dacf">

---

Introducing Circus, a discussion platform built on Next.js and Firebase. It now covers communities, voting, saved posts, and admin controls.
Users join and manage communities, post with images, vote, share, and save posts for later. Threaded comments and search keep discussions connected.
Authentication supports email/password plus Google and GitHub. Profile edits sync to posts and comments. The UI is responsive with light/dark mode and global toasts.

# **Requirements**
These are the requirements needed to run the project:
- Node.js 22+
- Yarn 1.22+
- Firebase project with Auth, Firestore, and Storage
- Firebase CLI for deploying functions

# **Features**
## **Authentication & Account Management**
The system has several key user authentication and account management features designed to ensure that users have a seamless and secure experience:
- Users can sign up using email and password
- Users can sign up using third-party authentication providers such as Google and GitHub
- Users can log in and log out
- Users can reset their password
- Users can update their profile image and username, with changes synced to posts and comments

## **Community**
The system has several key community management features designed to promote engagement and collaboration among users:
- Users can create communities with public, restricted, or private types
- Users can subscribe and unsubscribe to and from a community
- Admins can upload, change, or delete the community logo
- Admins can change community visibility
- Admins can add or remove other admins
- Admins can remove members from a community
- Users can view and paginate public and restricted communities, grouped by moderating, joined, or discover
- Admins can delete a community with cascade cleanup of posts, comments, votes, snippets, and images

## **Posts**
The system has several key features designed to make it easy for users to create and view posts within communities:
- Users can create a post in a specific community with an optional image
- Users can browse infinite feeds per community or home, with personalized subscribed feeds and a vote-ranked feed for guests
- Users can open a post to interact with threaded comments
- Users can view posts from subscribed communities and discover posts from all communities
- Users can delete a post they have created
- Users can vote on a post
- Users can share a post
- Users can save and unsave posts, and review them in a saved posts modal

## **Comments**
The web application has several key features designed to make it easy for users to engage with others by creating and viewing comments:
- Users can create threaded replies to posts and comments
- Users can view nested comments in a post
- Users can delete a comment they created
- Comment counts stay in sync when threads change

## **General**
The system has several general features to make the site user-friendly and accessible:
- Logged-in users can view an infinite home feed from communities they are subscribed to
- Logged-out users can view a vote-ranked home feed from all communities
- Global search modal for public communities and recent posts
- Community discovery and recommendations with infinite scroll
- System UI is responsive, hence it can be used on smartphones, tablets, or computers
- Global light/dark-mode toggle with preference persistence across sessions
- Toast notifications for key actions

# **Stack**
These are the main technologies that were used in this project:

## **Front-End**
- [**TypeScript**](https://www.typescriptlang.org/): Typed React code for safer changes and strong editor support.
- [**Next.js (App Router)**](https://nextjs.org/): Runs on Next.js 16 with the App Router on React 18, using server components, streaming layouts, and route handlers in `app/`.
- [**Jotai State Manager**](https://github.com/pmndrs/jotai/): Lightweight global state for posts, votes, communities, saved posts, and modals.
- [**Chakra UI**](https://chakra-ui.com/): Chakra UI 3 with a custom theme, Emotion styling, and `next-themes` for persistent light/dark mode.


## **Back-End**
- [**Firebase**](https://firebase.google.com/): Firestore, Auth, and Storage power the app; Cloud Functions sync user documents and remove saved posts when a post is deleted.

# **Running Application Locally**
These are simple steps to run the application locally. For more detail instructions, refer to the [Wiki](https://github.com/mbeps/next_discussion_platform/wiki). 

## 1. **Clone the Project Locally**
```sh
git clone https://github.com/mbeps/next_discussion_platform.git
```

## 2. **Install Dependencies**
```sh
yarn install
```

## 3. **Set Up Environment**
1. Copy the `.env.example` file and call it `.env.local`
2. Populate the `.env.local` with the required Firebase secrets 

## 4. **Set Up Firebase**
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
These support feed and comments queries.

| Collection ID | Fields Indexed                                                      |
| ------------- | ------------------------------------------------------------------- |
| `posts`       | `communityId` Ascending `createdAt` Descending __name__ Descending  |
| `comments`    | `postId` Ascending `createdAt` Descending __name__ Descending       |
| `posts`       | `communityId` Ascending `createTime` Descending __name__ Descending |

## 5. **Run Project**
```sh
yarn dev
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
