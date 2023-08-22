The `components` directory in this project contains various subdirectories that store components used throughout the application. 
Chakra UI has been used as a components library hence these components are built using the Chakra UI's base components, more on the [Chakra UI](https://chakra-ui.com/) website. 
These components are organized into subdirectories to maintain a clean and structured project, making it easier to understand and maintain the codebase.

# **Subsections (Components Collection)**
Here's a brief description of each subdirectory:

- `atoms`: This directory contains smaller components that are used as building blocks for larger components. Examples include icons, error messages, and menu buttons.
- `Community`: This directory holds components related to communities, such as the `About` component, `CommunityItem`, `CreatePostLink`, `Header` on the community page (containing the icon, name, and subscribe/unsubscribe button), `NotFound`, `PersonalHome`, and `Recommendations`.
- `Layout`: This directory contains components responsible for the overall layout of the website, which includes a navbar at the top, posts on the left, and extra content on the right (hidden on mobile screen sizes).
- `Modal`: This directory stores various pop-up modal components, such as the authentication modal, the create community modal (displayed when the user is authenticated), the community settings modal (shown only when the user is the admin of the current community), and the user profile modal (visible when the user is signed in).
- `Loaders`: This directory contains components that display loading placeholders for different parts of the application while data is being fetched.
- `Navbar`: This directory houses the components for the navbar at the top of the site, which includes the home button, community directory (visible when the user is logged in), search bar (non-functional), actions (create post), profile menu, and authentication buttons (displayed when the user is not signed in).
- `Posts`: This directory contains components related to posts, such as the post item, post form, and comments.
