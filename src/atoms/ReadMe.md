This directory contains Recoil atoms that manage the state of the discussion platform. These atoms handle different parts of the application state such as posts, directory menu, communities, and authentication modal. Data stored in the Firebase backend is also stored in these atoms for specific users, this prevents data from being fetched every time which improves the performance; when a piece of data is updated in the Firebase backend, the Recoil state atoms are also updated, updating the user interface without requiring a refetch. 

# **Files**
There are several files which keep track of different states across the app. 
## **`postAtom.ts`**
Manages the state of the posts across the app. This includes the posts themselves and the states for the current user. This is updated each time the user logs in and out. 

This file contains the following:
- `Post` type: Represents a post created by users. This mirrors the `posts` stored in the Firestore database. 
- `PostVote` type: Represents user voting on a post. This mirrors specific instances of a user's votes (`postVotes`) in the Firestore database. 
- `PostState` interface: Represents the base state for the Recoil atom. This is the type of the Recoil atom. 
- `defaultPostState` constant: Represents the default state of the Recoil atom, initially not posts are selected, there are no posts and no votes; this data is fetched from Firebase and stored in the state.
- `postState` atom: Manages the state of posts.

## **`directoryMenu.ts`**
Manages the directory menu shown in the navbar when the user is logged in. This menu can be opened by multiple components hence a global Recoil state is required. This is updated when the user is logged (populating their subscribed communities) and when subscribing and unsubscribing to and from communities. This is updated each time the user logs in and out. 

This file contains the following:
- `DirectoryMenuItem` type: Represents the current page. By default, it shows the home page (as the initial page is home) or displays other pages (all communities and specific community)
- `defaultMenuItem` constant: Represents the default menu item when no community is selected (home page).
- `DirectoryMenuState` interface: Represents the state of the directory menu; whether it is open or closed and the current page (represented by `DirectoryMenuItem`)
- `defaultMenuState` constant: Represents the default state of the directory menu which is closed and in the home page. 
- `directoryMenuState` atom: Manages the state of the directory menu across the site. 

## **`communitiesAtom.ts`**
Manages the state of the community across the app. Keeps track of the user's subscribed communities. This is updated each time the user logs in and out. 

This file contains the following:
- `Community` interface: Represents a community. This mirrors the `communities` stored in the Firestore database. 
- `CommunitySnippet` interface: Represents a snippet of a community without the full community data as it is not required. This snippet represent each subscribed community 
- `CommunityState` interface: Stores the community snippets (each subscribed community) to track the state of the subscribed communities and the currently selected community. 
- `defaultCommunityState` constant: Represents the default state of the community atom which is not subscribed community. 
- `communityState` atom: Manages the state of the communities.

## **`authModalAtom.ts`**
Manages the state of the authentication modal across the app. This is because multiple components and actions can trigger the authentication modal to be opened such as when the user clicks the authentication buttons, when an unauthenticated user tries to vote, create a comment and create a post. 

This file contains the following:
- `AuthModalState` interface: Represents the state of the authentication modal. 
- `defaultModalState` constant: Represents the default state of the authentication modal which is closed initially and on the log in page (if opened without specifying page). 
- `authModalState` atom: Manages the state of the authentication modal.

# **Usage**
These Recoil atoms can be imported into different components of the application to manage and update the state of the discussion platform. To learn more about Recoil atoms, visit the [Recoil documentation](https://recoiljs.org/docs/basic-tutorial/atoms/).