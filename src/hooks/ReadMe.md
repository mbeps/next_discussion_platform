This directory contains custom React hooks that provide reusable and encapsulated logic for various components in the React Community App. These hooks handle actions such as creating posts, managing post data, selecting and validating image files, fetching community data, and displaying toast notifications.

# **Hooks**
## **`useCallCreatePost.tsx`**
A custom hook that redirects the user to the post creation page. This hook does not handle managing (creating, deleting, editing, etc) posts. 

There are several events that the hook can take:
- If the is not authenticated, the authentication modal will be opened. An unauthenticated user cannot create a post. 
- If the user is not in a community page (ie. home page), the directory menu will be opened to allow the user to navigate to a community. This is because a post belongs to a specific community. 
- If the user is in a community page, then they will be redirected to the community's post creation page.

## **`useCommunityData.tsx`**
A custom hook that fetches community data and manages the related state. It provides a function to fetch the community data from the API and stores the fetched data in the state.

Functionality:
- Subscribing or unsubscribing to and from a community
- Fetching user's subscribed communities 
- Fetches the currently selected community's data (if the user selects it)

## **`useCustomToast.ts`**
A custom hook for displaying toast notifications in the application. It is a wrapper around the Chakra UI toast component, which provides a consistent way to display notifications with a custom style across the app.

Functionality:
- Displaying toast notifications with custom style
- Handling different notification statuses (e.g., success, error, warning, and info)

## **`useDirectory.tsx`**
A custom hook that allows the user to interact with the directory menu. The directory menu is displayed on the navbar when the user is logged in and allows the user to navigate to subscribed communities, create communities and view all communities. 

Functionality:
- Allows the user to select an entry in the menu to navigate to subscribed communities, create communities and view all communities.
- Allows toggling the menu when the user clicks it or by other events (trying to create a post from the home page).

## **`usePosts.tsx`**
A custom hook that manages post-related actions and state. It provides functions for voting on a post, selecting a post, and deleting a post. Additionally, it fetches community-specific post votes and updates the state accordingly.

Functionality:
- Voting on a post
- Selecting a post
- Deleting a post
- Fetching community-specific post votes
- Updating post state

## **`useSelectFile.tsx`**
A custom hook that provides functionality for selecting and validating image files. It checks the file size, type, and dimensions to ensure that the image meets the specified requirements. The hook also resizes the image to fit within the maximum allowed dimensions.

Functionality:
- Selecting an image file from the user's system
- Validating the file size, type, and dimensions
- Resizing the image to fit within the maximum allowed dimensions
