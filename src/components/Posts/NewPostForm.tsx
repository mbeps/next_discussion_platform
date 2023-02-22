import { Post } from "@/atoms/postsAtom";
import { firestore, storage } from "@/firebase/clientApp";
import useSelectFile from "@/hooks/useSelectFile";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
  Icon,
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
 * Tab object.
 * @param {title} - title of the tab
 * @param {icon} - icon of the tab
 */
export type FormTab = {
  title: string;
  icon: typeof Icon.arguments;
};

const NewPostForm: React.FC<NewPostFormProps> = ({
  user,
  communityImageURL,
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
        router.back(); // redirect user back to communities page after post is created
      }
    } catch (error: any) {
      console.log("Error: handleCreatePost", error.message);
      setError(true);
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
   * @param event (React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) - event object
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
    }));
  };

  return (
    <Flex direction="column" bg="white" borderRadius={10} mt={2}>
      <Flex width="100%">
        {/* create a tab item for each tab in the formTabs array */}
        {formTabs.map((item) => (
          <TabItem
            key={item.title}
            item={item}
            selected={item.title === selectedTab}
            setSelectedTab={setSelectedTab}
          />
        ))}
      </Flex>
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
      {/* If there is an error display an alert */}
      {error && (
        <Alert status="error">
          <AlertIcon />
          <Text mr={2} fontWeight={600} color="red.500">
            There has been an error when creating your post
          </Text>
        </Alert>
      )}
    </Flex>
  );
};
export default NewPostForm;
