import { Community } from "@/atoms/communitiesAtom";
import { Post } from "@/atoms/postsAtom";
import { firestore, storage } from "@/firebase/clientApp";
import useCustomToast from "@/hooks/useCustomToast";
import useSelectFile from "@/hooks/useSelectFile";
import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  Icon,
  Stack,
  Text,
} from "@chakra-ui/react";
import { User } from "firebase/auth";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { IoDocumentText, IoImageOutline } from "react-icons/io5";
import { MdOutlineArrowBackIos } from "react-icons/md";
import ImageUpload from "./PostForm/ImageUpload";
import TextInputs from "./PostForm/TextInputs";
import TabItem from "./TabItem";

/**
 * Props for NewPostForm component.
 * @param {user} - user object
 */
type NewPostFormProps = {
  user: User; // parent component checks user so additional checks aer not needed ut
  communityImageURL?: string;
  currentCommunity?: Community;
};

// Tab items which are static (not react) hence outside
/**
 * Tabs for post creation form.
 * Static array of objects which are used to dynamically create the navbar component.
 * @param {title} - title of the tab
 * @param {icon} - icon of the tab
 */
const formTabs: FormTab[] = [
  {
    title: "Post",
    icon: IoDocumentText,
  },
  {
    title: "Images",
    icon: IoImageOutline,
  },
  // more can be added which would dynamically be fitted into post creation navbar component
];

/**
 * @param {title} - title of the tab
 * @param {icon} - icon of the tab
 */
export type FormTab = {
  title: string;
  icon: typeof Icon.arguments;
};

/**
 * Component for creating a new post.
 * @param {User} user - user object
 * @param {string} communityImageURL - image url of the community
 * @param {Community} currentCommunity - current community
 *
 * @returns {React.FC} - NewPostForm component
 *
 * @requires TabList - tabs for post creation form
 * @requires BackToCommunityButton - button to go back to community page
 * @requires PostBody - body of the post
 * @requires PostCreateError - error message for post creation
 */
const NewPostForm: React.FC<NewPostFormProps> = ({
  user,
  communityImageURL,
  currentCommunity,
}) => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(formTabs[0].title); // formTabs[0] = Post
  const [textInputs, setTextInputs] = useState({
    title: "",
    body: "",
  });
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile(
    3000,
    3000
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const showToast = useCustomToast();
  const communityLink = `/community/${currentCommunity?.id}`;

  /**
   * Handles the creation of a new post.
   * Uploads the posts contents to Firestore including any optional image.
   *
   * @async
   */
  const handleCreatePost = async () => {
    const { communityId } = router.query;
    // create a new post object
    const newPost: Post = {
      communityId: communityId as string,
      communityImageURL: communityImageURL || "",
      creatorId: user?.uid,
      creatorUsername: user.email!.split("@")[0],
      title: textInputs.title,
      body: textInputs.body,
      numberOfComments: 0,
      voteStatus: 0,
      createTime: serverTimestamp() as Timestamp,
    }; // object representing the post

    setLoading(true);

    try {
      const postDocRef = await addDoc(collection(firestore, "posts"), newPost); // add the post to Firestore
      if (selectedFile) {
        // check if user has uploaded a file
        const imageRef = ref(storage, `posts/${postDocRef.id}/image`); // reference to where image is saved in Firebase storage
        await uploadString(imageRef, selectedFile, "data_url"); // upload the actual image
        const downloadURL = await getDownloadURL(imageRef); // get the link to the image
        await updateDoc(postDocRef, {
          // add image link to the posts in Firestore
          imageURL: downloadURL,
        });
      }
      router.push(communityLink); // redirect user back to communities page after post is created
    } catch (error: any) {
      console.log("Error: handleCreatePost", error.message);
      showToast({
        title: "Post not Created",
        description: "There was an error creating your post",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
    // store the post object in db

    // check for the selectedFile in case user uploaded file
    // if file is uploaded, store in firebase storage
    // get the link to file and store it to firestore
    // redirect user back to communities page
  };

  /**
   * Keeps track of the text inputs in the form and updates the state.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} event - event object from the input
   */
  const onTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {
      target: { name, value },
    } = event;
    setTextInputs((prev) => ({
      ...prev,
      [name]: value,
    })); // update the state
  };

  return (
    <Flex direction="column" bg="white" borderRadius={10} mt={2} shadow="md">
      <TabList
        formTabs={formTabs}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      <BackToCommunityButton communityId={currentCommunity?.id} />
      <PostBody
        selectedTab={selectedTab}
        handleCreatePost={handleCreatePost}
        onTextChange={onTextChange}
        loading={loading}
        textInputs={textInputs}
        selectedFile={selectedFile}
        onSelectFile={onSelectFile}
        setSelectedTab={setSelectedTab}
        setSelectedFile={setSelectedFile}
      />
      <PostCreateError error={error} />
    </Flex>
  );
};
export default NewPostForm;

/**
 * @param {FormTab[]} formTabs - array of form tabs
 * @param {string} selectedTab - currently selected tab
 * @param {React.Dispatch<React.SetStateAction<string>>} setSelectedTab - function to set the selected tab
 */
type TabListProps = {
  formTabs: FormTab[];
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
};

/**
 * Tab components displayed at the top of the post creation form.
 * Allows selecting between different tabs to create different types of posts.
 * @param {FormTab[]} formTabs - array of form tabs
 * @param {string} selectedTab - currently selected tab
 * @param {React.Dispatch<React.SetStateAction<string>>} setSelectedTab - function to set the selected tab
 *
 * @returns {React.FC} - TabList component
 *
 * @requires TabItem - individual tab item
 */
const TabList: React.FC<TabListProps> = ({
  formTabs,
  selectedTab,
  setSelectedTab,
}) => {
  return (
    <Stack width="100%" direction="row" spacing={2} p={2}>
      {/* create a tab item for each tab in the formTabs array */}
      {formTabs.map((item) => (
        <TabItem
          key={item.title}
          item={item}
          selected={item.title === selectedTab}
          setSelectedTab={setSelectedTab}
        />
      ))}
    </Stack>
  );
};

/**
 * @param {string} communityId - id of the community the user is currently in
 */
interface BackToCommunityButtonProps {
  communityId?: string;
}

/**
 * Button that redirects user back to the community page.
 * Returns to the appropriate community page depending on the communityId prop.
 * @param {string} communityId - id of the community the user is currently in
 *
 * @returns {React.FC} - button component that redirects user back to the community page
 */
const BackToCommunityButton: React.FC<BackToCommunityButtonProps> = ({
  communityId,
}) => {
  const router = useRouter();
  const communityLink = `/community/${communityId}`;

  return (
    <Button
      variant="outline"
      mt={4}
      ml={4}
      mr={4}
      justifyContent="left"
      width="fit-content"
      onClick={() => router.push(communityLink)}
    >
      <Icon as={MdOutlineArrowBackIos} mr={2} />
      {`Back to ${communityId}`}
    </Button>
  );
};

/**
 * @param {string} selectedTab - currently selected tab
 * @param {() => Promise<void>} handleCreatePost - function to create the post
 * @param {(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void} onTextChange - function to handle text input changes
 * @param {boolean} loading - whether the post is currently being created
 * @param {{title: string; body: string}} textInputs - object containing the title and body of the post
 * @param {string | undefined} selectedFile - file that the user has selected to upload
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} onSelectFile - function to handle file input changes
 * @param {React.Dispatch<React.SetStateAction<string>>} setSelectedTab - function to set the selected tab
 * @param {React.Dispatch<React.SetStateAction<string | undefined>>} setSelectedFile - function to set the selected file
 */
type PostBodyProps = {
  selectedTab: string;
  handleCreatePost: () => Promise<void>;
  onTextChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  loading: boolean;
  textInputs: {
    title: string;
    body: string;
  };
  selectedFile: string | undefined;
  onSelectFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<string | undefined>>;
};

/**
 * Displays the body of the post creation form.
 * Displays different inputs depending on the selected tab.
 * The body is:
 *  - `Post`: for creating a standard post (with a title and body)
 *  - 'Images': for creating a post with an image
 * @param {string} selectedTab - currently selected tab
 * @param {() => Promise<void>} handleCreatePost - function to create the post
 * @param {(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void} onTextChange - function to handle text input changes
 * @param {boolean} loading - whether the post is currently being created
 * @param {{title: string; body: string}} textInputs - object containing the title and body of the post
 * @param {string | undefined} selectedFile - file that the user has selected to upload
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} onSelectFile - function to handle file input changes
 * @param {React.Dispatch<React.SetStateAction<string>>} setSelectedTab - function to set the selected tab
 * @param {React.Dispatch<React.SetStateAction<string | undefined>>} setSelectedFile - function to set the selected file
 *
 * @returns {React.FC} - PostBody component
 *
 * @requires TextInputs - form for creating a standard post
 * @requires ImageUpload - form for creating a post with an image
 */
const PostBody: React.FC<PostBodyProps> = ({
  selectedTab,
  handleCreatePost,
  onTextChange,
  loading,
  textInputs,
  selectedFile,
  onSelectFile,
  setSelectedTab,
  setSelectedFile,
}) => {
  return (
    <Flex p={4}>
      {/* Display the correct form based on the selected tab */}
      {selectedTab === "Post" && (
        <TextInputs
          textInputs={textInputs}
          handleCreatePost={handleCreatePost}
          onChange={onTextChange}
          loading={loading}
        />
      )}
      {/* Display the image upload form if the user has selected the Images tab */}
      {selectedTab === "Images" && (
        <ImageUpload
          selectedFile={selectedFile}
          onSelectImage={onSelectFile}
          setSelectedTab={setSelectedTab}
          setSelectedFile={setSelectedFile}
        />
      )}
    </Flex>
  );
};

/**
 * @param {boolean} error - whether there has been an error when creating the post
 */
type Props = {
  error: boolean;
};

/**
 * Displays a alert if there has been an error when creating the post.
 * @param {boolean} error - whether there has been an error when creating the post
 * @returns {React.FC} - error component if there is an error when creating the post
 */
const PostCreateError: React.FC<Props> = ({ error }) => {
  return (
    <>
      {error && (
        <Alert status="error">
          <AlertIcon />
          <Text mr={2} fontWeight={600} color="red.500">
            There has been an error when creating your post
          </Text>
        </Alert>
      )}
    </>
  );
};
