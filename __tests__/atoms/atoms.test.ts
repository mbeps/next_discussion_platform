/// <reference types="vitest" />
import { describe, expect, it } from "vitest";
import { createStore } from "jotai";
import {
  communityStateAtom,
  defaultCommunityState,
} from "@/atoms/communitiesAtom";
import { postStateAtom } from "@/atoms/postsAtom";
import { savedPostStateAtom } from "@/atoms/savedPostsAtom";
import { defaultMenuItem, directoryMenuAtom } from "@/atoms/directoryMenuAtom";
import { authModalStateAtom } from "@/atoms/authModalAtom";

describe("communityStateAtom", () => {
  it("defaults to empty snippets and snippetFetched false", () => {
    const store = createStore();
    expect(store.get(communityStateAtom)).toEqual({
      mySnippets: [],
      snippetFetched: false,
    });
  });

  it("defaultCommunityState has no currentCommunity", () => {
    expect(defaultCommunityState.currentCommunity).toBeUndefined();
  });

  it("can be set and read back", () => {
    const store = createStore();
    const next = {
      mySnippets: [{ communityId: "react", isAdmin: false }],
      currentCommunity: { id: "react" },
      snippetFetched: true,
    };
    store.set(communityStateAtom, next);
    expect(store.get(communityStateAtom)).toEqual(next);
  });
});

describe("postStateAtom", () => {
  it("defaults to null selectedPost and empty arrays", () => {
    const store = createStore();
    expect(store.get(postStateAtom)).toEqual({
      selectedPost: null,
      posts: [],
      postVotes: [],
    });
  });

  it("can be set and read back", () => {
    const store = createStore();
    const post = { id: "p1", title: "T" };
    store.set(postStateAtom, {
      selectedPost: post as never,
      posts: [post as never],
      postVotes: [],
    });
    expect(store.get(postStateAtom).selectedPost).toEqual(post);
    expect(store.get(postStateAtom).posts).toHaveLength(1);
  });
});

describe("savedPostStateAtom", () => {
  it("defaults to empty savedPosts, closed modal, not fetched", () => {
    const store = createStore();
    expect(store.get(savedPostStateAtom)).toEqual({
      savedPosts: [],
      isOpen: false,
      fetched: false,
    });
  });

  it("can toggle isOpen", () => {
    const store = createStore();
    store.set(savedPostStateAtom, {
      savedPosts: [],
      isOpen: true,
      fetched: false,
    });
    expect(store.get(savedPostStateAtom).isOpen).toBe(true);
  });
});

describe("directoryMenuAtom", () => {
  it("defaults to closed menu with Home item selected", () => {
    const store = createStore();
    const state = store.get(directoryMenuAtom);
    expect(state.isOpen).toBe(false);
    expect(state.selectedMenuItem.displayText).toBe("Home");
    expect(state.selectedMenuItem.link).toBe("/");
  });

  it("defaultMenuItem has an icon and iconColor", () => {
    expect(typeof defaultMenuItem.icon).toBe("function");
    expect(defaultMenuItem.iconColor).toEqual({
      base: "black",
      _dark: "white",
    });
  });
});

describe("authModalStateAtom", () => {
  it("defaults to closed on login view", () => {
    const store = createStore();
    expect(store.get(authModalStateAtom)).toEqual({
      open: false,
      view: "login",
    });
  });

  it("can open with a different view", () => {
    const store = createStore();
    store.set(authModalStateAtom, { open: true, view: "signup" });
    expect(store.get(authModalStateAtom)).toEqual({
      open: true,
      view: "signup",
    });
  });
});
